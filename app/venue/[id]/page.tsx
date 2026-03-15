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

  return (
    <main className="mx-auto max-w-4xl p-8">
      <h1 className="text-4xl font-bold">{name}</h1>
      <p className="mt-4 text-slate-600">
        {item.address?.postcode || "No Postcode"}
      </p>
      
      <pre className="mt-10 overflow-auto rounded bg-slate-900 p-4 text-xs text-green-400">
        {JSON.stringify(item, null, 2)}
      </pre>
    </main>
  );
}