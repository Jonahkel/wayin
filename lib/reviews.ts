export type CreateReviewInput = {
  title?: string;
  rating?: number;
  comment?: string;
  userId: number;
  locationId: number;
};

export async function createReview(input: CreateReviewInput) {
  const response = await fetch("/api/reviews", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const payload = (await response.json()) as unknown;

  if (!response.ok) {
    const message =
      typeof payload === "object" &&
      payload !== null &&
      "error" in payload &&
      typeof payload.error === "string"
        ? payload.error
        : "Failed to create review";

    throw new Error(message);
  }

  return payload;
}

export async function getReview(reviewId: number) {
  const response = await fetch(`/api/reviews?id=${reviewId}`);
  const payload = (await response.json()) as unknown;

  if (!response.ok) {
    const message =
      typeof payload === "object" &&
      payload !== null &&
      "error" in payload &&
      typeof payload.error === "string"
        ? payload.error
        : "Failed to fetch review";

    throw new Error(message);
  }

  return payload;
}

export async function getReviewsByLocationId(locationId: number) {
  const response = await fetch(`/api/reviews?locationId=${locationId}`);
  const payload = (await response.json()) as unknown;

  if (!response.ok) {
    const message =
      typeof payload === "object" &&
      payload !== null &&
      "error" in payload &&
      typeof payload.error === "string"
        ? payload.error
        : "Failed to fetch reviews";

    throw new Error(message);
  }

  return payload;
}

export async function getReviewsByUserId(userId: number) {
  const response = await fetch(`/api/reviews?userId=${userId}`);
  const payload = (await response.json()) as unknown;

  if (!response.ok) {
    const message =
      typeof payload === "object" &&
      payload !== null &&
      "error" in payload &&
      typeof payload.error === "string"
        ? payload.error
        : "Failed to fetch reviews";

    throw new Error(message);
  }

  return payload;
}

export async function getAllReviews() {
  const response = await fetch("/api/reviews");
  const payload = (await response.json()) as unknown;

  if (!response.ok) {
    const message =
      typeof payload === "object" &&
      payload !== null &&
      "error" in payload &&
      typeof payload.error === "string"
        ? payload.error
        : "Failed to fetch reviews";

    throw new Error(message);
  }

  return payload;
}

export type UpdateReviewInput = {
  id: number;
  title?: string;
  rating?: number;
  comment?: string;
};

export async function updateReview(input: UpdateReviewInput) {
  const response = await fetch("/api/reviews", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const payload = (await response.json()) as unknown;

  if (!response.ok) {
    const message =
      typeof payload === "object" &&
      payload !== null &&
      "error" in payload &&
      typeof payload.error === "string"
        ? payload.error
        : "Failed to update review";

    throw new Error(message);
  }

  return payload;
}

export async function deleteReview(reviewId: number) {
  const response = await fetch(`/api/reviews?id=${reviewId}`, {
    method: "DELETE",
  });

  const payload = (await response.json()) as unknown;

  if (!response.ok) {
    const message =
      typeof payload === "object" &&
      payload !== null &&
      "error" in payload &&
      typeof payload.error === "string"
        ? payload.error
        : "Failed to delete review";

    throw new Error(message);
  }

  return payload;
}