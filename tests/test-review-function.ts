import "dotenv/config";

// This is an integration test: it creates real Prisma data, rewrites relative
// fetch calls to the local Next dev server, and verifies the review was stored.

import { PrismaClient } from "../app/generated/prisma/client";
import { createReview, type CreateReviewInput } from "../lib/reviews";

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
  console.log("\nTesting createReview helper against the live API...\n");

  const originalFetch = globalThis.fetch;
  let userId: number | undefined;
  let locationId: number | undefined;
  let reviewId: number | undefined;

  try {
    const user = await prisma.user.create({
      data: {
        username: `test_review_helper_${Date.now()}`,
        profileImageUrl: null,
      },
    });
    userId = user.id;

    const location = await prisma.location.create({
      data: {
        name: "Review Helper Test Venue",
        address: "456 Test Ave",
        city: "Ann Arbor",
        state: "MI",
        zip: "48104",
        latitude: 42.2808,
        longitude: -83.7462,
        reviewCount: 0,
      },
    });
    locationId = location.id;

    const input: CreateReviewInput = {
      title: "Great accessibility",
      rating: 5,
      comment: "Ramps and wide aisles.",
      userId,
      locationId,
    };

    let fetchUrl = "";

    globalThis.fetch = (async (url: string | URL | Request, options?: RequestInit) => {
      fetchUrl = typeof url === "string" ? url : url.toString();
      const resolvedUrl =
        typeof url === "string" && url.startsWith("/")
          ? `http://localhost:3000${url}`
          : url;

      return originalFetch(resolvedUrl, options);
    }) as typeof fetch;

    const result = await createReview(input);
    const createdReview = await prisma.review.findFirst({
      where: {
        userId,
        locationId,
        title: input.title,
      },
      include: {
        user: true,
        location: true,
      },
      orderBy: {
        id: "desc",
      },
    });

    reviewId = createdReview?.id;

    const updatedLocation = await prisma.location.findUnique({
      where: { id: locationId },
    });

    check("Calls review endpoint", fetchUrl === "/api/reviews", `received ${fetchUrl}`);
    check(
      "Returns created review",
      typeof result === "object" && result !== null && "id" in result
    );
    check(
      "Persists review in database",
      !!createdReview,
      "review was not found in database"
    );
    check(
      "Stores rating",
      createdReview?.rating === input.rating,
      `received ${createdReview?.rating}`
    );
    check(
      "Links created user",
      createdReview?.userId === userId,
      `received ${createdReview?.userId}`
    );
    check(
      "Links created location",
      createdReview?.locationId === locationId,
      `received ${createdReview?.locationId}`
    );
    check(
      "Increments location review count",
      updatedLocation?.reviewCount === 1,
      `received ${updatedLocation?.reviewCount}`
    );
  } finally {
    globalThis.fetch = originalFetch;

    if (reviewId !== undefined) {
      await prisma.review.delete({ where: { id: reviewId } });
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