import { headers } from "next/headers";
import SearchResultItem from "@/components/SearchResultItem"; // Import the client component

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
    errorMessage = "Something went wrong while fetching search results.";
  }

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: "28px", marginBottom: "8px" }}>Search Results</h1>
      <p style={{ marginBottom: "24px", color: "#666" }}>
        Showing results for: <strong>{q}</strong>
      </p>

      {errorMessage && <div style={{ color: "red" }}>{errorMessage}</div>}

      <div style={{ display: "grid", gap: "16px", maxWidth: "700px" }}>
        {!errorMessage &&
          data.map((item: any) => (
            /* Use the Client Component here */
            <SearchResultItem key={item.place_id} item={item} />
          ))}
      </div>
    </div>
  );
}