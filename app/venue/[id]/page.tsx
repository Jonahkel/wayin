import Link from "next/link";

export default async function VenueDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const res = await fetch(
    `https://nominatim.openstreetmap.org/lookup?osm_ids=${id}&format=json&addressdetails=1`,
    {
      headers: { "User-Agent": "WayIn-App-v1" },
    }
  );

  const response = await res.json();

  // Error handling for the UI
  if (!res.ok || response.error || response.length === 0) {
    return (
      <div className="p-10 text-center">
        <h1 className="text-xl font-bold">Location not found</h1>
        <p className="text-slate-500">ID: {id} is incorrect or expired.</p>
      </div>
    );
  }

  const item = response[0];
  const name = item.name || item.display_name || "Location Details";
  const address = item.display_name;

  // MOCK DATA (replace with DB later)
  const reviews = [
    {
      id: 1,
      rating: 4,
      text: "Pretty accessible, but the entrance is a bit tight.",
      tag: "Wheelchair Access",
    },
    {
      id: 2,
      rating: 2,
      text: "No ramp available. Difficult to enter.",
      tag: "Accessibility",
    },
  ];

  const avgRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        ).toFixed(1)
      : null;

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
                      {i < review.rating ? "⭐" : "☆"}
                    </span>
                  ))}
                </div>
                <span className="text-sm text-slate-500">
                  {review.rating}/5
                </span>
              </div>

              {/* Tag */}
              <p className="mt-2 text-xs font-bold uppercase text-rose-900">
                {review.tag}
              </p>

              {/* Text */}
              <p className="mt-2 text-sm text-slate-700">
                {review.text}
              </p>
            </div>
          ))
        )}
      </div>
    </main>
  );
}