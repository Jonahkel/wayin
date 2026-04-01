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
      aria-label={`${venue.name}, ${venue.address}, ${venue.city}, ${venue.state} ${venue.zip}. ${venue.reviewCount} reviews.`}
      aria-pressed={isSelected}
      className={cn(
        "flex w-full cursor-pointer items-start gap-4 overflow-hidden rounded-2xl bg-slate-100 p-4 transition-all",
        "min-h-16",
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
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <h3 className="text-2xl font-bold leading-snug text-slate-800">
          {venue.name}
        </h3>
        <p className="mt-1 text-sm leading-relaxed text-slate-500">
          {venue.address}
          <br />
          {venue.city}, {venue.state} {venue.zip}
        </p>
        <div className="mt-3 flex items-center gap-2 font-medium text-slate-700">
          <PlusCircle className="size-5 shrink-0" aria-hidden="true" />
          <span className="text-sm">
            {venue.reviewCount} {venue.reviewCount === 1 ? "Review" : "Reviews"}
          </span>
        </div>
      </div>
      <div className="relative size-20 shrink-0 overflow-hidden rounded-md lg:size-24">
        <img
          src={venue.imageUrl}
          alt={venue.imageAlt}
          className="absolute inset-0 size-full object-cover"
          loading="lazy"
        />
      </div>
    </article>
  );
}
