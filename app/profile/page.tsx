"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, User, LogOut } from "lucide-react";
import {
  deleteReviewByIdForUser,
  getReviewsByUserId,
  Review,
} from "@/lib/temp-review-store";

type LocationMeta = {
  name: string;
  address: string;
};

function getReviewTimestamp(review: Review) {
  if (review.createdAt) {
    const parsed = new Date(review.createdAt).getTime();
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }

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

export default function ProfilePage() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const [locationsById, setLocationsById] = useState<
    Record<string, LocationMeta>
  >({});
  const [reviewsRefreshToken, setReviewsRefreshToken] = useState(0);

  const tagStyles: Record<string, string> = {
    happy: "border border-blue-300/60 bg-blue-100 text-blue-900",
    neutral: "border border-yellow-300/70 bg-yellow-100 text-yellow-900",
    sad: "border border-red-300/60 bg-red-100 text-red-900",
  };

  // Handle the redirect inside useEffect to avoid the "update during render" error
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  const reviews = useMemo(() => {
    if (!user) return [];

    // Refresh token is used to force recomputation after local review mutations.
    const refreshToken = reviewsRefreshToken;
    const sortedReviews = [...getReviewsByUserId(user.id)].sort(
      (a, b) => getReviewTimestamp(b) - getReviewTimestamp(a),
    );

    return refreshToken >= 0 ? sortedReviews : sortedReviews;
  }, [user, reviewsRefreshToken]);

  useEffect(() => {
    if (reviews.length === 0) {
      return;
    }

    const locationIds = Array.from(
      new Set(reviews.map((review) => review.locationId)),
    );
    let isCancelled = false;

    async function fetchLocations() {
      const entries = await Promise.all(
        locationIds.map(async (locationId) => {
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/lookup?osm_ids=${encodeURIComponent(locationId)}&format=json&addressdetails=1`,
            );

            const data = await response.json();
            if (!response.ok || !Array.isArray(data) || data.length === 0) {
              return [
                locationId,
                { name: "Unknown venue", address: `ID: ${locationId}` },
              ] as const;
            }

            const venue = data[0];
            const name = venue.name || venue.display_name || "Unknown venue";
            const address = venue.display_name || `ID: ${locationId}`;

            return [locationId, { name, address }] as const;
          } catch {
            return [
              locationId,
              { name: "Unknown venue", address: `ID: ${locationId}` },
            ] as const;
          }
        }),
      );

      if (!isCancelled) {
        setLocationsById(Object.fromEntries(entries));
      }
    }

    fetchLocations();

    return () => {
      isCancelled = true;
    };
  }, [reviews]);

  const handleDeleteReview = (reviewId: number) => {
    if (!user) return;

    const didConfirm = window.confirm(
      "Delete this review? This action cannot be undone.",
    );
    if (!didConfirm) return;

    const deleted = deleteReviewByIdForUser(reviewId, user.id);
    if (!deleted) return;
    setReviewsRefreshToken((current) => current + 1);
  };

  // While checking auth status or if user is missing, show a loading state
  // This prevents the page from trying to render user data that isn't there
  if (isLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-muted-foreground animate-pulse">
          Loading profile...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <main className="mx-auto max-w-5xl space-y-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="gap-2 mb-4"
        >
          <ArrowLeft className="size-4" />
          Back
        </Button>
        <Card className="shadow-lg border-border">
          <CardHeader className="flex flex-row items-center gap-4 space-y-0">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <User className="size-8 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">User Profile</CardTitle>
              <p className="text-sm text-muted-foreground">
                Manage your account settings
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 pt-6">
            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">
                Username
              </label>
              <div className="p-3 rounded-md bg-muted/50 border border-border">
                <p className="text-lg font-semibold text-foreground">
                  {user.name || "N/A"}
                </p>
              </div>
            </div>

            <hr className="border-border" />

            <div className="flex justify-end">
              <Button
                variant="destructive"
                onClick={() => {
                  if (logout) logout();
                  // No need to router.push here manually if your useEffect handles the !user case
                }}
                className="gap-2"
              >
                <LogOut className="size-4" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>

        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Your Reviews
            </h2>
            <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold tracking-wide text-slate-700">
              Newest first
            </span>
          </div>

          {reviews.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-100 p-6 text-slate-600">
              You have not added any reviews yet.
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => {
                const locationMeta = locationsById[review.locationId];

                return (
                  <article
                    key={review.id}
                    className="rounded-2xl border border-slate-300/80 bg-slate-100 p-5 shadow-sm transition hover:shadow-md"
                  >
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <Link
                        href={`/venue/${review.locationId}`}
                        className="block underline-offset-4 hover:underline"
                        aria-label={`Open ${locationMeta?.name ?? "location"}`}
                      >
                        <p className="text-lg font-semibold leading-7 text-slate-900 sm:text-xl">
                          {locationMeta?.name ?? "Loading venue..."}
                        </p>
                        <p className="text-sm leading-6 text-slate-600 sm:text-base">
                          {locationMeta?.address ?? `ID: ${review.locationId}`}
                        </p>
                      </Link>

                      <span className="shrink-0 rounded-full bg-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600">
                        {formatTimeAgo(getReviewTimestamp(review))}
                      </span>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="flex items-center gap-2">
                        <div className="flex text-lg">
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
                    </div>

                    {review.title && (
                      <p className="mt-3 text-lg font-semibold text-slate-900">
                        {review.title}
                      </p>
                    )}

                    {review.comment && (
                      <p className="mt-2 text-sm text-slate-700 sm:text-base">
                        {review.comment}
                      </p>
                    )}

                    {review.tags && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {Object.entries(review.tags).map(([tag, value]) =>
                          value ? (
                            <span
                              key={tag}
                              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tagStyles[value] ?? "bg-slate-200 text-slate-700"}`}
                            >
                              {tag}
                            </span>
                          ) : null,
                        )}
                      </div>
                    )}

                    <div className="mt-4 flex justify-end">
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteReview(review.id)}
                        className="min-h-11 px-4"
                        aria-label={`Delete review ${review.title ?? "for this venue"}`}
                      >
                        Delete
                      </Button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
