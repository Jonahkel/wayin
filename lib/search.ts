// lib/search.ts
// USE IF WE WANT TO REMOVE SELF FETCH API CAL IN API/SEARCH/PAGE.TSX
// lib/search.ts

export interface SearchParams {
  q?: string;
  lat?: string | null;
  lon?: string | null;
  amenity?: string | null;
}

export async function getOSMResults({ q, lat, lon, amenity }: SearchParams) {
  if (!q && !amenity) {
    throw new Error("Either search term (q) or amenity type is required");
  }

  // 1. Build search query
  let searchQuery = amenity ? `[amenity=${amenity}]` : "";
  if (q) {
    searchQuery += (searchQuery ? " " : "") + q;
  }

  let osmUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    searchQuery
  )}&limit=10`;

  // 2. Handle bounding box logic
  if (lat && lon) {
    const l = parseFloat(lon);
    const t = parseFloat(lat);
    const viewbox = `${l - 0.1},${t + 0.1},${l + 0.1},${t - 0.1}`;
    osmUrl += `&viewbox=${viewbox}&bounded=1`;
  }

  // 3. Perform the actual external fetch
  const response = await fetch(osmUrl, {
    headers: { 'User-Agent': 'SchoolAccessibilityProject/1.0' },
    next: { revalidate: 3600 } // Optional: Cache results for 1 hour
  });

  if (!response.ok) {
    throw new Error(`OSM API error: ${response.statusText}`);
  }

  return response.json();
}