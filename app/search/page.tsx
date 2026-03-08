import { headers } from "next/headers";

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
    const res = await fetch(
      `http://${host}/api/search?q=${encodeURIComponent(q)}`
    );

    // fetch doesn't throw on 404/500, so we check res.ok manually
    if (!res.ok) {
      throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
    }

    data = await res.json();
  } catch (error) {
    console.error("Search fetch error:", error);
    errorMessage = "Something went wrong while fetching search results.";
  }

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: "28px", marginBottom: "8px" }}>Search Results</h1>

      <p style={{ marginBottom: "24px", color: "#666" }}>
        Showing results for: <strong>{q}</strong>
      </p>

      {/* Display Error Message */}
      {errorMessage && (
        <div style={{ color: "red", padding: "1rem", border: "1px solid red", borderRadius: "8px" }}>
          {errorMessage}
        </div>
      )}

      {/* Display No Results */}
      {!errorMessage && data.length === 0 && <p>No results found.</p>}

      <div style={{ display: "grid", gap: "16px", maxWidth: "700px" }}>
        {!errorMessage &&
          data.map((item: any) => (
            <div
              key={item.place_id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "10px",
                padding: "16px",
                background: "#fafafa",
              }}
            >
              <h2 style={{ fontSize: "18px", marginBottom: "6px" }}>
                {item.name || item.display_name.split(",")[0]}
              </h2>

              <p style={{ fontSize: "14px", color: "#555", marginBottom: "8px" }}>
                {item.display_name}
              </p>

              <div style={{ fontSize: "12px", color: "#888" }}>
                <div>Latitude: {item.lat}</div>
                <div>Longitude: {item.lon}</div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}