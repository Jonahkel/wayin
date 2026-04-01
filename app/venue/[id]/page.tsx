"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getReviewsByLocation, Review } from "@/lib/temp-review-store";
import { useParams } from "next/navigation";

function getReviewTimestamp(review: Review) {
  if (review.createdAt) {
    const parsed = new Date(review.createdAt).getTime();
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }

  // Backward compatibility for older local reviews that do not have createdAt.
  return review.id;
}

function formatTimeAgo(timestamp: number) {
  const elapsed = Date.now() - timestamp;
  if (elapsed < 0) return "just now";

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const month = 30 * day;
  const year = 365 * day;

  if (elapsed < minute) return "just now";

  const units = [
    { ms: year, label: "yr" },
    { ms: month, label: "mo" },
    { ms: day, label: "day" },
    { ms: hour, label: "hr" },
    { ms: minute, label: "min" },
  ];

  for (const unit of units) {
    if (elapsed >= unit.ms) {
      const value = Math.floor(elapsed / unit.ms);
      if (unit.label === "day") {
        return `${value} ${value === 1 ? "day" : "days"} ago`;
      }
      return `${value} ${unit.label} ago`;
    }
  }

  return "just now";
}

export default function VenueDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [venue, setVenue] = useState<any>(null);
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    async function fetchVenue() {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/lookup?osm_ids=${id}&format=json&addressdetails=1`,
        { headers: { "User-Agent": "WayIn-App-v1" } },
      );

      const response = await res.json();

      if (!res.ok || response.error || response.length === 0) {
        setVenue(null);
        return;
      }

      setVenue(response[0]);
    }

    fetchVenue();
  }, [id]);

  useEffect(() => {
    const data = getReviewsByLocation(id);
    const sortedByNewest = [...data].sort(
      (a, b) => getReviewTimestamp(b) - getReviewTimestamp(a),
    );
    setReviews(sortedByNewest);
  }, [id]);

  if (!venue) {
    return (
      <div className="p-10 text-center">
        <h1 className="text-xl font-bold">Location not found</h1>
        <p className="text-slate-500">ID: {id} is incorrect or expired.</p>
      </div>
    );
  }

  const name = venue.name || venue.display_name || "Location Details";
  const address = venue.display_name;

  const avgRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, r) => sum + (r.rating ?? 0), 0) / reviews.length
        ).toFixed(1)
      : null;

  const tagStyles: Record<string, string> = {
    happy: "border border-blue-300/60 bg-blue-100 text-blue-900",
    neutral: "border border-yellow-300/70 bg-yellow-100 text-yellow-900",
    sad: "border border-red-300/60 bg-red-100 text-red-900",
  };

  return (
    <main
      id="main-content"
      className="min-h-screen bg-white px-4 py-8 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-5xl">
        <div className="mb-5">
          <Link
            href="/"
            className="inline-flex items-center border-slate-300 bg-white/85 px-4 py-2 text-sm font-medium text-slate-700 backdrop-blur transition hover:border-slate-400 hover:bg-white"
          >
            ← Back to Home
          </Link>
        </div>

        <section className="rounded-3xl  border-slate-300/70 bg-white/90 backdrop-blur p-3">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {name}
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-slate-600">
            {address}
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-300 bg-slate-100 px-4 py-3">
              <span className="text-2xl font-bold text-slate-900">
                {avgRating ? `${avgRating}` : "N/A"}
              </span>
              <span className="text-sm font-medium text-slate-600">
                {avgRating ? "Average rating" : "No ratings yet"}
              </span>
              <span className="text-sm text-slate-500">
                ({reviews.length} reviews)
              </span>
            </div>

            <Link href={`/venue/${id}/review`}>
              <button className="min-h-11 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2">
                Add Review
              </button>
            </Link>
          </div>
        </section>

        <section className="mt-8 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Community Reviews
            </h2>
            <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold tracking-wide text-slate-700">
              Newest first
            </span>
          </div>

          {reviews.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-100 p-6 text-slate-600">
              No reviews yet. Be the first to add one!
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => {
                return (
                  <article
                    key={review.id}
                    className="rounded-2xl border border-slate-300/80 bg-slate-100 p-5 shadow-sm transition hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="flex text-lg"
                          aria-label="Review rating"
                        >
                          {[...Array(5)].map((_, i) => (
                            <span key={i}>
                              {i < (review.rating ?? 0) ? "★" : "☆"}
                            </span>
                          ))}
                        </div>
                        <span className="rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-slate-700">
                          {review.rating ?? 0}/5
                        </span>
                      </div>

                      <span className="rounded-full bg-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600">
                        {formatTimeAgo(getReviewTimestamp(review))}
                      </span>
                    </div>

                    {review.title && (
                      <p className="mt-3 text-lg font-semibold tracking-tight text-slate-900">
                        {review.title}
                      </p>
                    )}

                    <p className="mt-2 text-sm leading-relaxed text-slate-700 sm:text-base">
                      {review.comment}
                    </p>

                    {review.tags && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {Object.entries(review.tags).map(([tag, value]) =>
                          value ? (
                            <span
                              key={tag}
                              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tagStyles[value]}`}
                            >
                              {tag}
                            </span>
                          ) : null,
                        )}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
