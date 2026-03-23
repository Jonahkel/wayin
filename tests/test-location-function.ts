import "dotenv/config";

import { PrismaClient } from "../app/generated/prisma/client";
import { createReview, getReview, type CreateReviewInput } from "../lib/reviews";

const prisma = new PrismaClient();

let passed = 0;
let failed = 0;

function check(name: string, condition: boolean, detail?: string) {
  if (condition) {
    console.log(`  ✓ ${name}`);
    passed++;
  } else {
    console.log(`  ✗ ${name}${detail ? `: ${detail}` : ""}`);
    failed++;
  }
}

async function runTests() {
  console.log("\nTesting review helpers against live API and direct DB reads...\n");

  const originalFetch = globalThis.fetch;
  let userId: number | undefined;
  let locationId: number | undefined;
  let reviewId: number | undefined;
  const fetchUrls: string[] = [];

  try {
    const suffix = Date.now();

    const user = await prisma.user.create({
      data: {
        username: `test_review_compare_${suffix}`,
        profileImageUrl: null,
      },
    });
    userId = user.id;

    const location = await prisma.location.create({
      data: {
        id: 900000000 + (suffix % 1000000),
        name: "Review Compare Test Location",
        address: "1 Test St",
        city: "Ann Arbor",
        state: "MI",
        zip: "48104",
        latitude: 42.2808,
        longitude: -83.743,
        reviewCount: 0,
      },
    });
    locationId = location.id;

    globalThis.fetch = (async (url: string | URL | Request, options?: RequestInit) => {
      const fetchUrl = typeof url === "string" ? url : url.toString();
      fetchUrls.push(fetchUrl);
      const resolvedUrl =
        typeof url === "string" && url.startsWith("/")
          ? `http://localhost:3000${url}`
          : url;

      return originalFetch(resolvedUrl, options);
    }) as typeof fetch;

    const input: CreateReviewInput = {
      title: "Function vs DB",
      rating: 5,
      comment: "Ensure helper response matches DB.",
      userId,
      locationId,
    };

    const createdByFunction = await createReview(input);
    reviewId = createdByFunction.id;

    const createdInDb = await prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        user: true,
        location: true,
      },
    });

    check(
      "createReview posts to reviews endpoint",
      fetchUrls.includes("/api/reviews"),
      `received ${fetchUrls.join(", ")}`
    );
    check("createReview result has an id", typeof createdByFunction.id === "number");
    check("createReview persisted review", !!createdInDb, "review was not found in database");
    check(
      "createReview title matches DB",
      createdByFunction.title === createdInDb?.title,
      `function=${createdByFunction.title}, db=${createdInDb?.title}`
    );
    check(
      "createReview rating matches DB",
      createdByFunction.rating === createdInDb?.rating,
      `function=${createdByFunction.rating}, db=${createdInDb?.rating}`
    );
    check(
      "createReview comment matches DB",
      createdByFunction.comment === createdInDb?.comment,
      `function=${createdByFunction.comment}, db=${createdInDb?.comment}`
    );
    check(
      "createReview user relation matches DB",
      createdByFunction.user.id === createdInDb?.user.id,
      `function=${createdByFunction.user.id}, db=${createdInDb?.user.id}`
    );
    check(
      "createReview location relation matches DB",
      createdByFunction.location.id === createdInDb?.location.id,
      `function=${createdByFunction.location.id}, db=${createdInDb?.location.id}`
    );

    const fetchedByFunction = await getReview(reviewId);
    const fetchedInDb = await prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        user: true,
        location: true,
      },
    });

    check(
      "getReview calls review endpoint by id",
      fetchUrls.includes(`/api/reviews?id=${reviewId}`),
      `received ${fetchUrls.join(", ")}`
    );
    check(
      "getReview title matches DB",
      fetchedByFunction.title === fetchedInDb?.title,
      `function=${fetchedByFunction.title}, db=${fetchedInDb?.title}`
    );
    check(
      "getReview rating matches DB",
      fetchedByFunction.rating === fetchedInDb?.rating,
      `function=${fetchedByFunction.rating}, db=${fetchedInDb?.rating}`
    );
    check(
      "getReview comment matches DB",
      fetchedByFunction.comment === fetchedInDb?.comment,
      `function=${fetchedByFunction.comment}, db=${fetchedInDb?.comment}`
    );
    check(
      "getReview user relation matches DB",
      fetchedByFunction.user.id === fetchedInDb?.user.id,
      `function=${fetchedByFunction.user.id}, db=${fetchedInDb?.user.id}`
    );
    check(
      "getReview location relation matches DB",
      fetchedByFunction.location.id === fetchedInDb?.location.id,
      `function=${fetchedByFunction.location.id}, db=${fetchedInDb?.location.id}`
    );
  } finally {
    globalThis.fetch = originalFetch;

    if (reviewId !== undefined) {
      const reviewExists = await prisma.review.findUnique({ where: { id: reviewId } });
      if (reviewExists) {
        await prisma.review.delete({ where: { id: reviewId } });
      }
    }

    if (locationId !== undefined) {
      await prisma.location.delete({ where: { id: locationId } });
    }

    if (userId !== undefined) {
      await prisma.user.delete({ where: { id: userId } });
    }

    await prisma.$disconnect();
  }

  console.log(`\n${"=".repeat(32)}`);
  console.log(`Results: ${passed} passed, ${failed} failed`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((error) => {
  console.error("\n✗ Unexpected error:", error instanceof Error ? error.message : error);
  process.exit(1);
});
