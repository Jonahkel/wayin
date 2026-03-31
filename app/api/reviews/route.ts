import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

type CreateReviewRequestBody = {
  title?: unknown;
  rating?: unknown;
  comment?: unknown;
  userId?: unknown;
  locationId?: unknown;
  tagRatings?: unknown;
};

type ParsedTagRatingInput = {
  tagId: number;
  rating: number;
};

const reviewInclude = {
  user: true,
  location: true,
  tagRatings: {
    include: {
      tag: true,
    },
  },
} as const;

function normalizeOptionalString(value: unknown) {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : undefined;
}

function parsePositiveInteger(value: unknown) {
  if (typeof value === "number" && Number.isInteger(value) && value > 0) {
    return value;
  }

  if (typeof value === "string") {
    const parsedValue = Number(value);
    if (Number.isInteger(parsedValue) && parsedValue > 0) {
      return parsedValue;
    }
  }

  return undefined;
}

function parseRating(value: unknown) {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (typeof value === "number" && Number.isInteger(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsedValue = Number(value);
    if (Number.isInteger(parsedValue)) {
      return parsedValue;
    }
  }

  return Number.NaN;
}

function parseTagRatings(value: unknown) {
  if (value === undefined) {
    return { tagRatings: undefined as ParsedTagRatingInput[] | undefined };
  }

  if (!Array.isArray(value)) {
    return {
      error:
        "tagRatings must be an array of objects with tagId and rating fields",
    };
  }

  const parsedTagRatings: ParsedTagRatingInput[] = [];
  const tagIds = new Set<number>();

  for (const item of value) {
    if (typeof item !== "object" || item === null) {
      return {
        error:
          "tagRatings must be an array of objects with tagId and rating fields",
      };
    }

    const tagId = parsePositiveInteger(
      (item as { tagId?: unknown }).tagId
    );
    const tagRating = parseRating((item as { rating?: unknown }).rating);

    if (tagId === undefined) {
      return { error: "Each tag rating must include a positive integer tagId" };
    }

    if (
      tagRating === undefined ||
      !Number.isInteger(tagRating) ||
      tagRating < 1 ||
      tagRating > 3
    ) {
      return { error: "Each tag rating must be an integer between 1 and 3" };
    }

    if (tagIds.has(tagId)) {
      return { error: "tagRatings cannot contain duplicate tagId values" };
    }

    tagIds.add(tagId);
    parsedTagRatings.push({ tagId, rating: tagRating });
  }

  return { tagRatings: parsedTagRatings };
}

export async function POST(request: Request) {
  let body: CreateReviewRequestBody;

  try {
    body = (await request.json()) as CreateReviewRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const title = normalizeOptionalString(body.title);
  const comment = normalizeOptionalString(body.comment);
  const rating = parseRating(body.rating);
  const userId = parsePositiveInteger(body.userId);
  const locationId = parsePositiveInteger(body.locationId);
  const parsedTagRatingsResult = parseTagRatings(body.tagRatings);

  if ("error" in parsedTagRatingsResult) {
    return NextResponse.json(
      { error: parsedTagRatingsResult.error },
      { status: 400 }
    );
  }

  const tagRatings = parsedTagRatingsResult.tagRatings;

  if (userId === undefined) {
    return NextResponse.json(
      { error: "userId must be a positive integer" },
      { status: 400 }
    );
  }

  if (locationId === undefined) {
    return NextResponse.json(
      { error: "locationId must be a positive integer" },
      { status: 400 }
    );
  }

  if (
    rating !== undefined &&
    (!Number.isInteger(rating) || rating < 1 || rating > 5)
  ) {
    return NextResponse.json(
      { error: "rating must be an integer between 1 and 5" },
      { status: 400 }
    );
  }

  if (rating === undefined && !comment) {
    return NextResponse.json(
      { error: "A review must include a rating or comment" },
      { status: 400 }
    );
  }

  try {
    const review = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new Error("USER_NOT_FOUND");
      }

      const location = await tx.location.findUnique({ where: { id: locationId } });
      if (!location) {
        throw new Error("LOCATION_NOT_FOUND");
      }

      if (tagRatings !== undefined && tagRatings.length > 0) {
        const existingTags = await tx.tag.findMany({
          where: {
            id: { in: tagRatings.map((tagRating) => tagRating.tagId) },
            isActive: true,
          },
          select: { id: true },
        });

        if (existingTags.length !== tagRatings.length) {
          throw new Error("INVALID_TAGS");
        }
      }

      const createdReview = await tx.review.create({
        data: {
          title,
          rating,
          comment,
          userId,
          locationId,
          ...(tagRatings !== undefined
            ? {
                tagRatings: {
                  create: tagRatings.map((tagRating) => ({
                    tagId: tagRating.tagId,
                    rating: tagRating.rating,
                  })),
                },
              }
            : {}),
        },
        include: reviewInclude,
      });

      await tx.location.update({
        where: { id: locationId },
        data: {
          reviewCount: {
            increment: 1,
          },
        },
      });

      return createdReview;
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "USER_NOT_FOUND") {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (error instanceof Error && error.message === "LOCATION_NOT_FOUND") {
      return NextResponse.json({ error: "Location not found" }, { status: 404 });
    }

    if (error instanceof Error && error.message === "INVALID_TAGS") {
      return NextResponse.json(
        { error: "One or more tagIds are invalid or inactive" },
        { status: 400 }
      );
    }

    console.error("Failed to create review", error);
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const reviewId = searchParams.get("id");
  const locationId = searchParams.get("locationId");
  const userId = searchParams.get("userId");

  try {
    if (reviewId) {
      const parsedReviewId = parsePositiveInteger(reviewId);
      if (!parsedReviewId) {
        return NextResponse.json(
          { error: "id must be a positive integer" },
          { status: 400 }
        );
      }

      const review = await prisma.review.findUnique({
        where: { id: parsedReviewId },
        include: reviewInclude,
      });

      if (!review) {
        return NextResponse.json({ error: "Review not found" }, { status: 404 });
      }

      return NextResponse.json(review);
    }

    if (locationId) {
      const parsedLocationId = parsePositiveInteger(locationId);
      if (!parsedLocationId) {
        return NextResponse.json(
          { error: "locationId must be a positive integer" },
          { status: 400 }
        );
      }

      const reviews = await prisma.review.findMany({
        where: { locationId: parsedLocationId },
        include: reviewInclude,
      });

      return NextResponse.json(reviews);
    }

    if (userId) {
      const parsedUserId = parsePositiveInteger(userId);
      if (!parsedUserId) {
        return NextResponse.json(
          { error: "userId must be a positive integer" },
          { status: 400 }
        );
      }

      const reviews = await prisma.review.findMany({
        where: { userId: parsedUserId },
        include: reviewInclude,
      });

      return NextResponse.json(reviews);
    }

    const allReviews = await prisma.review.findMany({
      include: reviewInclude,
    });

    return NextResponse.json(allReviews);
  } catch (error) {
    console.error("Failed to fetch reviews", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

type UpdateReviewRequestBody = {
  id?: unknown;
  title?: unknown;
  rating?: unknown;
  comment?: unknown;
  tagRatings?: unknown;
};

export async function PUT(request: Request) {
  let body: UpdateReviewRequestBody;

  try {
    body = (await request.json()) as UpdateReviewRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const reviewId = parsePositiveInteger(body.id);
  if (!reviewId) {
    return NextResponse.json(
      { error: "id must be a positive integer" },
      { status: 400 }
    );
  }

  const title = normalizeOptionalString(body.title);
  const comment = normalizeOptionalString(body.comment);
  const rating = parseRating(body.rating);
  const parsedTagRatingsResult = parseTagRatings(body.tagRatings);

  if ("error" in parsedTagRatingsResult) {
    return NextResponse.json(
      { error: parsedTagRatingsResult.error },
      { status: 400 }
    );
  }

  const tagRatings = parsedTagRatingsResult.tagRatings;

  if (
    rating !== undefined &&
    (!Number.isInteger(rating) || rating < 1 || rating > 5)
  ) {
    return NextResponse.json(
      { error: "rating must be an integer between 1 and 5" },
      { status: 400 }
    );
  }

  try {
    const existingReview = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!existingReview) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title;
    if (comment !== undefined) updateData.comment = comment;
    if (rating !== undefined) updateData.rating = rating;

    if (Object.keys(updateData).length === 0 && tagRatings === undefined) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    const updatedReview = await prisma.$transaction(async (tx) => {
      if (tagRatings !== undefined && tagRatings.length > 0) {
        const existingTags = await tx.tag.findMany({
          where: {
            id: { in: tagRatings.map((tagRating) => tagRating.tagId) },
            isActive: true,
          },
          select: { id: true },
        });

        if (existingTags.length !== tagRatings.length) {
          throw new Error("INVALID_TAGS");
        }
      }

      if (Object.keys(updateData).length > 0) {
        await tx.review.update({
          where: { id: reviewId },
          data: updateData,
        });
      }

      if (tagRatings !== undefined) {
        await tx.reviewTagRating.deleteMany({ where: { reviewId } });

        if (tagRatings.length > 0) {
          await tx.reviewTagRating.createMany({
            data: tagRatings.map((tagRating) => ({
              reviewId,
              tagId: tagRating.tagId,
              rating: tagRating.rating,
            })),
          });
        }
      }

      return tx.review.findUnique({
        where: { id: reviewId },
        include: reviewInclude,
      });
    });

    if (!updatedReview) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    return NextResponse.json(updatedReview);
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_TAGS") {
      return NextResponse.json(
        { error: "One or more tagIds are invalid or inactive" },
        { status: 400 }
      );
    }

    console.error("Failed to update review", error);
    return NextResponse.json(
      { error: "Failed to update review" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const reviewId = searchParams.get("id");

  if (!reviewId) {
    return NextResponse.json(
      { error: "id query parameter is required" },
      { status: 400 }
    );
  }

  const parsedReviewId = parsePositiveInteger(reviewId);
  if (!parsedReviewId) {
    return NextResponse.json(
      { error: "id must be a positive integer" },
      { status: 400 }
    );
  }

  try {
    const review = await prisma.review.findUnique({
      where: { id: parsedReviewId },
    });

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.review.delete({
        where: { id: parsedReviewId },
      });

      await tx.location.update({
        where: { id: review.locationId },
        data: {
          reviewCount: {
            decrement: 1,
          },
        },
      });
    });

    return NextResponse.json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error("Failed to delete review", error);
    return NextResponse.json(
      { error: "Failed to delete review" },
      { status: 500 }
    );
  }
}