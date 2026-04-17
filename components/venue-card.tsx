"use client";

import { PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Venue {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  reviewCount: number;
  imageUrl: string;
  imageAlt: string;
  lat: number;
  lng: number;
  description?: string;
}

interface VenueCardProps {
  venue: Venue;
  isSelected?: boolean;
  onSelect?: (venue: Venue) => void;
}

export function VenueCard({ venue, isSelected, onSelect }: VenueCardProps) {
  return (
    <article
      role="button"
      tabIndex={0}
      aria-label={`${venue.name}, ${venue.address}, ${venue.city}. ${venue.reviewCount} reviews.`}
      aria-pressed={isSelected}
      className={cn(
        "w-full cursor-pointer rounded-2xl bg-slate-100 p-4 transition-all",
        "hover:ring-2 hover:ring-slate-300",
        "focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:outline-none",
        isSelected ? "ring-2 ring-slate-400" : "ring-1 ring-slate-200",
      )}
      onClick={() => onSelect?.(venue)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect?.(venue);
        }
      }}
    >
      <h3 className="text-xl font-bold text-slate-800">
        {venue.name}
      </h3>

      <p className="mt-1 text-sm text-slate-500">
        {venue.address.split(",").slice(0, 3).join(",")}
      </p>

      <p className="text-sm text-slate-500">
        {venue.city}
      </p>

      <p className="mt-3 text-sm font-medium text-slate-700">
        {venue.reviewCount} {venue.reviewCount === 1 ? "Review" : "Reviews"}
      </p>
    </article>
  );
}
