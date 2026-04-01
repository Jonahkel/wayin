export type Review = {
  id: number;
  locationId: string;
  createdAt?: string;
  title?: string;
  rating?: number | null;
  comment?: string;
  tags?: Record<string, string | null>;
};

const STORAGE_KEY = "wayin-reviews";

function getAllReviews(): Review[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

function saveReviews(reviews: Review[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
}

export function addReview(review: Review) {
  const reviews = getAllReviews();
  reviews.push(review);
  saveReviews(reviews);
}

export function getReviewsByLocation(locationId: string) {
  const reviews = getAllReviews();
  return reviews.filter((r) => r.locationId === locationId);
}
