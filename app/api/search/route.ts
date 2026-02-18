import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get('q');
    
    // 1. Get latitude and longitude from the URL
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');

    if (!searchTerm) {
      return NextResponse.json({ error: "Search term is required" }, { status: 400 });
    }

    // 2. Base URL for OpenStreetMap
    let osmUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchTerm)}&limit=10`;

    // 3. If coordinates exist, add a "viewbox" (a 0.1 degree box around the point)
    if (lat && lon) {
      const l = parseFloat(lon);
      const t = parseFloat(lat);
      
      // We create a bounding box: [left, top, right, bottom]
      const viewbox = `${l - 0.1},${t + 0.1},${l + 0.1},${t - 0.1}`;
      
      // bounded=1 tells OSM to try and stay inside this box
      osmUrl += `&viewbox=${viewbox}&bounded=1`;
    }

    const response = await fetch(osmUrl, {
      headers: { 'User-Agent': 'SchoolAccessibilityProject/1.0' },
    });

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}