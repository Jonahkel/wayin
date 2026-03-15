import { Star, ChevronLeft, ChevronRight, User, ListFilter } from "lucide-react";

export default async function VenueDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Making the API call as requested
  const res = await fetch(
    `https://nominatim.openstreetmap.org/lookup?osm_ids=${id}&format=json&addressdetails=1`,
    {
      headers: {
        "User-Agent": "WayIn-App-v1",
      },
    }
  );

  if (!res.ok) return <div className="p-10 text-center">Fetch Error</div>;

  const data = await res.json();
  // Extracting data from the first object in the returned array
  const item = data[0] || {};
  
  // Directly extracting info from the JSON:
  const venueName = item.name || "Unknown Venue";
  const zipCode = item.address?.postcode || "No Zip";

  return (
    <div className="min-h-screen bg-white font-sans text-[#1e3a5f]">
      {/* --- Header Section (Blue Background) --- */}
      <section className="bg-[#d9eaff] px-4 py-16 text-center">
        <h1 className="mb-10 text-5xl font-bold">{venueName}</h1>

        {/* Carousel UI */}
        <div className="relative mx-auto flex max-w-5xl items-center justify-center gap-4">
          <button className="text-[#1e3a5f]">
            <ChevronLeft size={40} />
          </button>
          
          <div className="flex items-center gap-4">
            <div className="overflow-hidden rounded-2xl shadow-md">
              <img src="https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=300" alt="Bakery 1" className="h-44 w-60 object-cover" />
            </div>
            <div className="z-10 overflow-hidden rounded-2xl border-4 border-white shadow-xl">
              <img src="https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400" alt="Bakery 2" className="h-56 w-80 object-cover" />
            </div>
            <div className="overflow-hidden rounded-2xl shadow-md">
              <img src="https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=300" alt="Bakery 3" className="h-44 w-60 object-cover" />
            </div>
          </div>

          <button className="text-[#1e3a5f]">
            <ChevronRight size={40} />
          </button>
        </div>

        {/* Rating Stars */}
        <div className="mt-8 flex justify-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={48} strokeWidth={1.5} className="text-[#1e3a5f]" />
          ))}
        </div>

        {/* Leave a Review Button */}
        <div className="relative mt-8 inline-block">
          {/* Decorative Arrow SVG/Icons (simplified here as text) */}
          <span className="absolute -left-10 top-2 rotate-12 text-2xl opacity-50">➔</span>
          <button className="rounded-xl bg-[#ffb347] px-10 py-3 text-lg font-bold shadow-md transition-transform hover:scale-105">
            Leave a Review
          </button>
          <span className="absolute -right-10 top-2 -rotate-12 text-2xl opacity-50">➔</span>
        </div>
      </section>

      {/* --- Reviews & Ratings Section --- */}
      <section className="mx-auto max-w-5xl px-8 py-12">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-3xl font-bold">Reviews & Ratings</h2>
          <ListFilter size={24} className="cursor-pointer text-slate-600" />
        </div>

        {/* Review Card matching the screenshot */}
        <div className="rounded-2xl bg-[#f0f4f8] p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-end justify-center overflow-hidden rounded-full bg-[#ffcc33]">
              <User size={50} className="mb-[-4px] text-white" />
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold">No Ramp!</h3>
                  <div className="flex text-[#1e3a5f]">
                    <Star size={16} fill="currentColor" />
                    <Star size={16} fill="currentColor" />
                    <Star size={16} />
                    <Star size={16} />
                    <Star size={16} />
                  </div>
                  <span className="rounded-md bg-[#8b2e4a] px-3 py-1 text-xs font-bold text-white">
                    Wheelchair Access
                  </span>
                </div>
                <span className="text-sm text-slate-400 font-medium">Posted 1 mo ago</span>
              </div>
              <p className="mt-3 text-lg text-slate-600">
                There is no ramp to enter the building. Stairs only.
              </p>
              {/* Optional Postcode display from JSON */}
              <p className="mt-2 text-xs text-slate-400">Postal Code: {zipCode}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}