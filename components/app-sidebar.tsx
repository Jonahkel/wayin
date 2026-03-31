"use client";

import { DoorOpen, MapPin, User } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { VenueCard, type Venue } from "@/components/venue-card";
import { Button } from "@/components/ui/button";

interface AppSidebarProps {
  venues: Venue[];
  selectedVenue: Venue | null;
  onSelectVenue: (venue: Venue) => void;
  currentPage: number;
  totalPages: number;
  totalResults: number;
  onPageChange: (page: number) => void;
}

export function AppSidebar({
  venues,
  selectedVenue,
  onSelectVenue,
  currentPage,
  totalPages,
  totalResults,
}: AppSidebarProps) {
  return (
    <aside
      aria-label="Venue sidebar"
      className="flex h-full w-full flex-col bg-card"
    >
      {/* Header */}
      <header className="flex items-center justify-between px-5 pt-5 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2">
            <DoorOpen className="size-8 text-slate-700" />
            <span className="text-2xl font-semibold tracking-tight">WayIn</span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon-lg"
          aria-label="Open user profile"
          className="rounded-full"
        >
          <User className="size-6 text-muted-foreground" />
        </Button>
      </header>

      {/* Recent Searches heading */}
      <div className="px-5 pb-3">
        <h2 className="text-lg font-semibold italic text-foreground">
          Recent Searches
        </h2>
      </div>

      {/* Venue list */}
      <ScrollArea className="flex-1">
        <nav aria-label="Recent search results" className="px-5">
          <ul className="flex flex-col gap-3 pb-4" role="list">
            {venues.map((venue) => (
              <li key={venue.id} className="w-full">
                <VenueCard
                  venue={venue}
                  isSelected={selectedVenue?.id === venue.id}
                  onSelect={onSelectVenue}
                />
              </li>
            ))}
          </ul>
        </nav>
      </ScrollArea>

      {/* Pagination footer */}
      <footer className="flex flex-col items-center gap-2 border-t border-border px-5 py-4">
        <p className="text-sm text-muted-foreground">
          <span className="sr-only">Showing </span>
          {venues.length} of {totalResults} Results
        </p>
        <div
          className="flex items-center gap-2"
          role="group"
          aria-label="Pagination"
        >
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              aria-label={`Page ${i + 1}`}
              aria-current={currentPage === i ? "page" : undefined}
              className={`size-2.5 rounded-full transition-colors focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none ${
                currentPage === i
                  ? "bg-primary"
                  : "bg-border hover:bg-muted-foreground"
              }`}
              style={{ minWidth: "10px", minHeight: "10px" }}
            />
          ))}
        </div>
      </footer>
    </aside>
  );
}
