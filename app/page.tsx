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
import { useEffect } from "react";

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
  const [lat, setLat] = useState<number | null>(null);
  const [lon, setLon] = useState<number | null>(null);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const currentPage = 0;
  const isMobile = useIsMobile();
  const router = useRouter();

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      console.log("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log("Location:", position.coords);
        setLat(position.coords.latitude);
        setLon(position.coords.longitude);
      },
      (error) => {
        console.log("Location error:", error);
      }
    );
  };

  useEffect(() => {
    getUserLocation();
  }, []);

  const handleSelectVenue = useCallback((venue: Venue) => {
    setSelectedVenue((prev) => (prev?.id === venue.id ? null : venue));
    setMobileMenuOpen(false);
  }, []);

  const handleSearchSubmit = () => {
    const params = new URLSearchParams();

    if (searchInput.trim()) {
      params.append("q", searchInput);
    }

    if (lat && lon) {
      params.append("lat", lat.toString());
      params.append("lon", lon.toString());
    }

    if (!searchInput.trim()) return;

    router.push(`/search?${params.toString()}`);
  };

  return (
    // overflow-hidden prevents the whole page from scrolling if the content inside grows
    <div className="flex h-dvh w-full flex-col overflow-hidden lg:flex-row">
      
      {/* Desktop sidebar - Added h-full and overflow-y-auto */}
      <div className="hidden h-full w-80 shrink-0 overflow-y-auto border-r border-border lg:flex xl:w-96">
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
            Browse your recent venue searches.
          </SheetDescription>
          {/* Ensure the sidebar inside the sheet is also scrollable if it's long */}
          <div className="h-full overflow-y-auto">
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
        </SheetContent>
      </Sheet>

      {/* Map area */}
      <main id="main-content" className="relative flex-1">
        {/* Search bar overlay */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-1100 flex items-start justify-between gap-3 p-4">
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

        {/* Map - size-full ensures it fills the flex-1 area */}
        <div className="size-full">
            <VenueMap
            venues={recentVenues}
            selectedVenue={selectedVenue}
            onSelectVenue={handleSelectVenue}
            />
        </div>
      </main>
    </div>
  );
}