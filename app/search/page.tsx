import { headers } from "next/headers";
import { DoorOpen, UserCircle, Search, SlidersHorizontal } from "lucide-react";
import SearchResultItem from "@/components/SearchResultItem";
import { Button } from "@/components/ui/button";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const q = params.q ?? "";
  const host = (await headers()).get("host");

  let data = [];
  let errorMessage = null;

  try {
    const res = await fetch(`http://${host}/api/search?q=${encodeURIComponent(q)}&addressdetails=1`);
    if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
    data = await res.json();
  } catch (error) {
    errorMessage = "Something went wrong.";
  }

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      {/* Navbar */}
      <header className="flex items-center justify-between border-b px-6 py-3 shadow-sm">
        <div className="flex items-center gap-2">
          <DoorOpen className="size-8 text-slate-700" />
          <span className="text-2xl font-semibold tracking-tight">WayIn</span>
        </div>
        <div className="flex items-center gap-6">
          <button className="text-lg font-medium hover:underline">Home</button>
          <UserCircle className="size-9 text-slate-700" />
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-8">
        {/* Search Section */}
        <div className="mb-8 flex items-center gap-4">
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
              <Search className="size-5 text-slate-500" />
            </div>
            <input
              type="text"
              defaultValue={q}
              placeholder="Search"
              className="w-full rounded-xl bg-slate-200 py-4 pl-12 pr-4 text-lg focus:outline-none focus:ring-2 focus:ring-slate-300"
            />
          </div>
          <Button variant="ghost" size="icon" className="size-12">
            <SlidersHorizontal className="size-6" />
          </Button>
        </div>

        {/* Results Header */}
        <h2 className="mb-6 text-2xl font-bold">
          {data.length} {data.length === 1 ? "Result" : "Results"} for "{q}"
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