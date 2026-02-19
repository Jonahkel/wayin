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
        "flex w-full items-start gap-4 rounded-lg border-2 bg-card p-4 text-card-foreground transition-colors",
        "min-h-[4rem] cursor-pointer",
        "hover:border-accent hover:bg-secondary/50",
        "focus-visible:ring-ring/50 focus-visible:border-ring focus-visible:ring-[3px] outline-none",
        isSelected ? "border-accent bg-secondary/30" : "border-border",
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
        <h3 className="text-base font-bold leading-snug text-foreground">
          {venue.name}
        </h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {venue.address}
          <br />
          {venue.city}, {venue.state} {venue.zip}
        </p>
        <div className="mt-1 flex items-center gap-1.5">
          <PlusCircle
            className="size-4 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
          <span className="text-sm font-medium text-muted-foreground">
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
