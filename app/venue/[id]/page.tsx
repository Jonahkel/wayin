"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getReviewsByLocation, Review } from "@/lib/temp-review-store";
import { useParams } from "next/navigation";

export default function VenueDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [venue, setVenue] = useState<any>(null);
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    async function fetchVenue() {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/lookup?osm_ids=${id}&format=json&addressdetails=1`,
        { headers: { "User-Agent": "WayIn-App-v1" } }
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
    setReviews(data);
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
          reviews.reduce((sum, r) => sum + (r.rating ?? 0), 0) /
          reviews.length
        ).toFixed(1)
      : null;
  
  const tagStyles: Record<string, string> = {
    happy: "bg-blue-200 text-blue-900",
    neutral: "bg-yellow-200 text-yellow-900",
    sad: "bg-red-200 text-red-900",
  };

  return (
    <main className="mx-auto max-w-4xl p-8">

      {/*home button*/}
      <div className="mb-6">
        <Link href="/">
          <span className="cursor-pointer text-sm text-slate-600 hover:underline">
            ← Back to Home
          </span>
        </Link>
      </div>
      
      {/* Venue Info */}
      <h1 className="text-4xl font-bold">{name}</h1>
      <p className="mt-2 text-slate-600">{address}</p>

      {/* Rating Summary */}
      <div className="mt-6 flex items-center gap-3">
        <span className="text-2xl font-semibold">
          {avgRating ? `${avgRating}` : "No ratings yet"}
        </span>
        <span className="text-slate-500">
          ({reviews.length} reviews)
        </span>
      </div>

      {/* ➕ Add Review Button */}
      <Link href={`/venue/${id}/review`}>
        <button className="mt-6 rounded-lg bg-slate-900 px-4 py-2 text-white hover:bg-slate-700">
          Add Review
        </button>
      </Link>

      {/* Reviews List */}
      <div className="mt-10 space-y-6">
        <h2 className="text-2xl font-semibold">Reviews</h2>

        {reviews.length === 0 ? (
          <p className="text-slate-500">
            No reviews yet. Be the first to add one!
          </p>
        ) : (
          reviews.map((review) => (
            <div
              key={review.id}
              className="rounded-xl border border-slate-200 p-4 shadow-sm"
            >
              {/* - Stars */}
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <span key={i}>
                      {i < (review.rating ?? 0) ? "⭐" : "☆"}
                    </span>
                  ))}
                </div>
                <span className="text-sm text-slate-500">
                  {review.rating ?? 0}/5
                </span>
              </div>
              
              {review.title && (
                <p className="mt-2 font-semibold text-slate-900">{review.title}</p>
              )}

              <p className="mt-2 text-sm text-slate-700">
                {review.comment}
              </p>

              {review.tags && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {Object.entries(review.tags).map(([tag, value]) =>
                    value ? (
                      <span
                        key={tag}
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          tagStyles[value]
                        }`}
                      >
                        {tag}
                      </span>
                    ) : null
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </main>
  );
}