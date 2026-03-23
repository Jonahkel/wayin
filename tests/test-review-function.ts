import "dotenv/config";

// This is an integration test: it creates real Prisma data, rewrites relative
// fetch calls to the local Next dev server, and verifies the review was stored.

import { PrismaClient, Review } from "../app/generated/prisma/client";
import {
  createReview,
  type CreateReviewInput,
  getReview,
  getReviewsByLocationId,
  getReviewsByUserId,
  getAllReviews,
  updateReview,
  type UpdateReviewInput,
  deleteReview,
} from "../lib/reviews";

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
        id: 123,
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

    // Test getReview
    console.log("\nTesting getReview helper...\n");
    if (reviewId === undefined) {
      throw new Error("reviewId is undefined, creation failed");
    }
    const fetchedReview = await getReview(reviewId);
    if (fetchedReview === undefined) {
      throw new Error("reviewId is undefined, creation failed");
    }
    check("getReview returns review", !!fetchedReview && fetchedReview.id === reviewId);
    check(
      "getReview returns correct title",
      fetchedReview?.title === input.title
    );

    // Test getReviewsByLocationId
    console.log("\nTesting getReviewsByLocationId helper...\n");
    const reviewsByLocation = await getReviewsByLocationId(locationId);
    check(
      "getReviewsByLocationId returns array",
      Array.isArray(reviewsByLocation),
      `received ${typeof reviewsByLocation}`
    );
    check(
      "getReviewsByLocationId includes our review",
      Array.isArray(reviewsByLocation) &&
        reviewsByLocation.some((r: { id: number }) => r.id === reviewId),
      `array length: ${Array.isArray(reviewsByLocation) ? reviewsByLocation.length : "N/A"}`
    );

    // Test getReviewsByUserId
    console.log("\nTesting getReviewsByUserId helper...\n");
    const reviewsByUser = await getReviewsByUserId(userId);
    check(
      "getReviewsByUserId returns array",
      Array.isArray(reviewsByUser),
      `received ${typeof reviewsByUser}`
    );
    check(
      "getReviewsByUserId includes our review",
      Array.isArray(reviewsByUser) &&
        reviewsByUser.some((r: { id: number }) => r.id === reviewId)
    );

    // Test getAllReviews
    console.log("\nTesting getAllReviews helper...\n");
    const allReviews = await getAllReviews();
    check(
      "getAllReviews returns array",
      Array.isArray(allReviews),
      `received ${typeof allReviews}`
    );
    check(
      "getAllReviews includes our review",
      Array.isArray(allReviews) &&
        allReviews.some((r: { id: number }) => r.id === reviewId)
    );

    // Test updateReview
    console.log("\nTesting updateReview helper...\n");
    const updateInput: UpdateReviewInput = {
      id: reviewId,
      title: "Updated title",
      rating: 4,
      comment: "Updated comment",
    };
    const updatedReview = await updateReview(updateInput);
    check(
      "updateReview returns updated review",
      updatedReview?.title === updateInput.title
    );
    check(
      "updateReview updates rating",
      updatedReview?.rating === updateInput.rating
    );
    check(
      "updateReview updates comment",
      updatedReview?.comment === updateInput.comment
    );

    const dbUpdatedReview = await prisma.review.findUnique({
      where: { id: reviewId },
    });
    check(
      "updateReview persists to database",
      dbUpdatedReview?.title === updateInput.title
    );

    // Test deleteReview
    console.log("\nTesting deleteReview helper...\n");
    const deleteResult = await deleteReview(reviewId);
    check(
      "deleteReview returns success message",
      typeof deleteResult === "object" &&
        deleteResult !== null &&
        "message" in deleteResult
    );

    const deletedReview = await prisma.review.findUnique({
      where: { id: reviewId },
    });
    check("deleteReview removes from database", deletedReview === null);

    const finalLocation = await prisma.location.findUnique({
      where: { id: locationId },
    });
    check(
      "deleteReview decrements location review count",
      finalLocation?.reviewCount === 0,
      `received ${finalLocation?.reviewCount}`
    );
    reviewId = undefined; // Already deleted
  } finally {
    globalThis.fetch = originalFetch;

    // Only delete review if it still exists (not already deleted by deleteReview test)
    if (reviewId !== undefined) {
      const reviewExists = await prisma.review.findUnique({
        where: { id: reviewId },
      });
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