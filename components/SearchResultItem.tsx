"use client";

import { useVenues } from "@/context/VenueContext";
import { useRouter } from "next/navigation";
import { PlusCircle, Star } from "lucide-react";
import type { Venue } from "@/components/venue-card";

export default function SearchResultItem({ item }: { item: any }) {
  const { addVenue } = useVenues();
  const router = useRouter();

  const handleVenueClick = () => {
    const addr = item.address || {};
    const newVenue: Venue = {
      id: item.osm_type.charAt(0).toUpperCase() + item.osm_id.toString(), // allows for the /lookup API call
      name: item.name || item.display_name.split(",")[0],
      address: item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      city: addr.city || addr.town || addr.village || addr.suburb || item.display_name.split(",")[3]?.trim() || "Unknown City",
      state: addr.state || "N/A",
      zip: addr.postcode || "N/A",
      imageUrl: item.icon,
      reviewCount: 0,
      imageAlt: "Location Image"
    };

    addVenue(newVenue);
    console.log(newVenue.id);
    router.push(`/venue/${newVenue.id}`);
  };

  // UI Helpers
  const name = item.name || item.display_name.split(",")[0];
  const addressParts = item.display_name.split(",");
  const shortAddress = addressParts.slice(1, 4).join(",");

  return (
    <div 
      onClick={handleVenueClick}
      className="grid cursor-pointer grid-cols-1 overflow-hidden rounded-2xl bg-slate-100 p-6 shadow-sm transition-all hover:ring-2 hover:ring-slate-300 md:grid-cols-[1fr_2px_1.5fr]"
    >
      {/* 1. Left Column: Venue Details */}
      <div className="flex flex-col justify-between pr-8">
        <div>
          <h3 className="text-2xl font-bold text-slate-800">{name}</h3>
          <p className="mt-1 text-sm text-slate-500">{shortAddress}</p>
          
          <div className="mt-4 flex flex-wrap gap-2">
            {/* Fake Examples Below */}
            {/* <Badge color="bg-rose-900">Wheelchair Access</Badge>
            <Badge color="bg-orange-200 text-orange-900">Menu Readability</Badge>
            <Badge color="bg-slate-900">Service Animal Access</Badge> */}
          </div>
        </div>

        <div className="mt-6 flex items-center gap-2 font-medium text-slate-700">
          <PlusCircle className="size-6" />
          <span>"PLZ CONNECT TO DB TO GET NUMBER YALL" Reviews</span>
        </div>
      </div>

      {/* 2. Vertical Divider */}
      <div className="hidden bg-slate-300 md:block" />

      {/* 3. Right Column: Reviews (Mocked) */}
      {/* Fake Examples Below */}
      {/* <div className="space-y-6 pl-0 pt-6 md:pl-8 md:pt-0">
        <ReviewPreview 
          userColor="bg-orange-400"
          title="No Ramp!" 
          rating={1} 
          tag="Wheelchair Access" 
          text="There is no ramp to enter the building. Stairs only."
        />
        <ReviewPreview 
          userColor="bg-blue-400"
          title="Loud Music" 
          rating={4} 
          tag="Noise Levels" 
          text="The music is a bit loud, but the atmosphere is great."
        />
      </div> */}
    </div>
  );
}

function Badge({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <span className={`rounded-md px-3 py-1 text-xs font-bold text-white ${color}`}>
      {children}
    </span>
  );
}

function ReviewPreview({ userColor, title, rating, tag, text }: any) {
  return (
    <div className="flex gap-3">
      <div className={`size-8 shrink-0 rounded-full ${userColor}`} />
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-bold">{title}</h4>
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`size-3 ${i < rating ? "fill-slate-700 text-slate-700" : "text-slate-300"}`} />
            ))}
          </div>
        </div>
        <p className="text-[10px] font-bold text-rose-900 uppercase tracking-tight">{tag}</p>
        <p className="mt-1 text-xs leading-relaxed text-slate-600 line-clamp-2">{text}</p>
      </div>
    </div>
  );
}