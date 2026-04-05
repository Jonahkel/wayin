import { headers } from "next/headers";
import { DoorOpen, UserCircle, Search, SlidersHorizontal } from "lucide-react";
import SearchResultItem from "@/components/SearchResultItem";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    amenity?: string;
    lat?: string;
    lon?: string;
  }>;
}) {
  const params = await searchParams;
  const q = params.q ?? "";
  const amenity = params.amenity ?? "";
  const lat = params.lat ?? "";
  const lon = params.lon ?? "";
  const host = (await headers()).get("host");

  let data = [];
  let errorMessage = null;

  try {
    const query = new URLSearchParams();

    if (q) query.append("q", q);
    if (amenity) query.append("amenity", amenity);
    if (lat) query.append("lat", lat);
    if (lon) query.append("lon", lon);

    const res = await fetch(`http://${host}/api/search?${query.toString()}`);
    if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
    data = await res.json();
  } catch (error) {
    errorMessage = "Something went wrong.";
  }

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      <Navbar />

      <main className="mx-auto max-w-7xl p-8">
        {/* Search Section */}
        <form
          action="/search"
          method="get"
          className="mb-8 flex items-center gap-4"
        >
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
              <Search className="size-5 text-slate-500" />
            </div>
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Search"
              className="w-full rounded-xl bg-slate-200 py-4 pl-12 pr-4 text-lg focus:outline-none focus:ring-2 focus:ring-slate-300"
            />
          </div>
          {amenity ? (
            <input type="hidden" name="amenity" value={amenity} />
          ) : null}
          {lat ? <input type="hidden" name="lat" value={lat} /> : null}
          {lon ? <input type="hidden" name="lon" value={lon} /> : null}
          <Button
            type="submit"
            variant="ghost"
            size="icon"
            className="size-12"
            aria-label="Search"
          >
            <SlidersHorizontal className="size-6" />
          </Button>
        </form>

        {/* Results Header */}
        <h2 className="mb-6 text-2xl font-bold">
          {data.length} {data.length === 1 ? "Result" : "Results"} for &quot;
          {q || amenity}&quot;
        </h2>

        {errorMessage && <div className="text-destructive">{errorMessage}</div>}

        {/* Results List */}
        <div className="space-y-6">
          {!errorMessage &&
            data.map((item: any) => (
              <SearchResultItem key={item.place_id} item={item} />
            ))}
        </div>
      </main>
    </div>
  );
}
