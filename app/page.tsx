"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { Menu } from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import { MapSearchBar } from "@/components/map-search-bar";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useRouter } from "next/navigation";
import { useVenues } from "@/context/VenueContext";

import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import type { Venue } from "@/components/venue-card";

const VenueMap = dynamic(
  () => import("@/components/venue-map").then((mod) => mod.VenueMap),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex size-full items-center justify-center bg-muted"
        role="status"
        aria-label="Loading map"
      >
        <p className="text-sm text-muted-foreground">Loading map...</p>
      </div>
    ),
  },
);

export default function HomePage() {
  const { recentVenues } = useVenues(); 
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const currentPage = 0;
  const isMobile = useIsMobile();
  const router = useRouter();


  const handleSelectVenue = useCallback((venue: Venue) => {
    setSelectedVenue((prev) => (prev?.id === venue.id ? null : venue));
    setMobileMenuOpen(false);
  }, []);

  const handleSearchSubmit = () => {
    if (!searchInput.trim()) return;

    const params = new URLSearchParams();
    params.append("q", searchInput);

    router.push(`/search?${params.toString()}`);
};

  return (
    <div className="flex h-dvh w-full flex-col lg:flex-row">
      {/* Desktop sidebar */}
      <div className="hidden w-80 shrink-0 border-r border-border lg:flex xl:w-96">
        <AppSidebar
          venues={recentVenues}
          selectedVenue={selectedVenue}
          onSelectVenue={handleSelectVenue}
          currentPage={currentPage}
          totalPages={1}
          totalResults={recentVenues.length}
          onPageChange={() => {}}
        />
      </div>

      {/* Mobile sheet */}
      <Sheet open={isMobile && mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="z-1200 w-80 p-0 sm:max-w-80">
          <SheetTitle className="sr-only">Recent Searches</SheetTitle>
          <SheetDescription className="sr-only">
            Browse your recent venue searches and select one to view on the map.
          </SheetDescription>
          <AppSidebar
            venues={recentVenues}
            selectedVenue={selectedVenue}
            onSelectVenue={handleSelectVenue}
            currentPage={currentPage}
            totalPages={1}
            totalResults={recentVenues.length}
            onPageChange={() => {}}
          />
        </SheetContent>
      </Sheet>

      {/* Map area */}
      <main id="main-content" className="relative flex-1">
        {/* Search bar overlay */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-1100 flex items-start justify-between gap-3 p-4">
          {/* Mobile menu toggle */}
          <Button
            variant="outline"
            size="icon-lg"
            aria-label="Open venue list"
            className="pointer-events-auto size-12 shrink-0 rounded-lg bg-card shadow-md lg:hidden"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="size-5 text-foreground" />
          </Button>

          <div className="pointer-events-auto flex-1">
            <MapSearchBar
              searchQuery={searchInput}
              onSearchChange={setSearchInput}
              onSearchSubmit={handleSearchSubmit}
            />

          </div>
        </div>

        {/* Map */}
        <VenueMap
          venues={recentVenues}
          selectedVenue={selectedVenue}
          onSelectVenue={handleSelectVenue}
        />
      </main>
    </div>
  );
}
