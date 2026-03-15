"use client";

import { useVenues } from "@/context/VenueContext";
import { useRouter } from "next/navigation";
import type { Venue } from "@/components/venue-card";

interface SearchResultItemProps {
  item: any; 
}

export default function SearchResultItem({ item }: SearchResultItemProps) {
  const { addVenue } = useVenues();
  const router = useRouter();

  const handleVenueClick = () => {
    // OpenStreetMap puts address details in an 'address' object
    const addr = item.address || {};

    // 1. Transform the API data into your 'Venue' type
    const newVenue: Venue = {
      id: item.place_id.toString(),
      name: item.name || item.display_name.split(",")[0],
      address: item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      
      // Mapping address details
      // OSM uses city/town/village/suburb depending on location density
      city: addr.city || addr.town || addr.village || addr.suburb || "Unknown City",
      state: addr.state || "N/A",
      zip: addr.postcode || "N/A",

      imageUrl: item.icon,
      
      // Default values for missing social/meta data
      reviewCount: 0,
      imageAlt: "Location Image"
    };

    // 2. Add to context
    addVenue(newVenue);

    // 3. Redirect home
    router.push("/");
  };

  return (
    <div
      onClick={handleVenueClick}
      style={{
        border: "1px solid #ddd",
        borderRadius: "10px",
        padding: "16px",
        background: "#fafafa",
        cursor: "pointer",
      }}
      className="hover:border-primary/50 hover:bg-accent/10 transition-all shadow-sm"
    >
      <h2 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "4px" }}>
        {item.name || item.display_name.split(",")[0]}
      </h2>
      <p style={{ fontSize: "14px", color: "#666", marginBottom: "12px", lineHeight: "1.4" }}>
        {item.display_name}
      </p>
      <div style={{ display: "flex", gap: "12px", fontSize: "11px", color: "#999" }}>
        <span className="bg-muted px-2 py-0.5 rounded">Lat: {parseFloat(item.lat).toFixed(4)}</span>
        <span className="bg-muted px-2 py-0.5 rounded">Lon: {parseFloat(item.lon).toFixed(4)}</span>
      </div>
    </div>
  );
}