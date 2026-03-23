import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const searchTerm = searchParams.get('q');
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');
    const amenity = searchParams.get('amenity');

    if (!searchTerm && !amenity) {
      return NextResponse.json(
        { error: "Either search term (q) or amenity type is required" },
        { status: 400 }
      );
    }

    // -----------------------------
    // CASE 1: Default Nominatim search
    // -----------------------------
    let searchQuery = "";

    if (amenity && searchTerm) {
      searchQuery = `${amenity} ${searchTerm}`;
    } else if (amenity) {
      searchQuery = amenity;
    } else {
      searchQuery = searchTerm!;
    }

    let osmUrl =
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        searchQuery
      )}&limit=10`;

    if (lat && lon) {
      const l = parseFloat(lon);
      const t = parseFloat(lat);

      const viewbox = `${l - 0.1},${t + 0.1},${l + 0.1},${t - 0.1}`;
      osmUrl += `&viewbox=${viewbox}&bounded=1`;
    }

    const response = await fetch(osmUrl, {
      headers: {
        "User-Agent": "SchoolAccessibilityProject/1.0",
      },
    });

    const data = await response.json();

    return NextResponse.json(data);

  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}