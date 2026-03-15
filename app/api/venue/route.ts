import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing ID" }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/lookup?osm_ids=${id}&format=json&addressdetails=1`,
      {
        headers: { "User-Agent": "WayIn-App-v1" },
      }
    );

    const data = await res.json();

    if (!res.ok || !data || data.length === 0 || data.error) {
      return NextResponse.json({ error: "Location not found" }, { status: 404 });
    }

    // Return the JSON for the test to validate
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: "Fetch failed" }, { status: 500 });
  }
}