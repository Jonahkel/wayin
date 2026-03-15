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