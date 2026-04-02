"use client";

import { useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import { Menu, User } from "lucide-react"; 
import { useRouter } from "next/navigation";

// Internal Components
import { AppSidebar } from "@/components/app-sidebar";
import { MapSearchBar } from "@/components/map-search-bar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";

// Hooks & Context
import { useIsMobile } from "@/hooks/use-mobile";
import { useVenues } from "@/context/VenueContext";
import { useAuth } from "@/hooks/use-auth"; // <--- Our new hook

// Types
import type { Venue } from "@/components/venue-card";

// Dynamic Import for Map (Client-side only)
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
  // 1. Hook Initializations
  const { recentVenues } = useVenues();
  const { user, isLoading } = useAuth(); 
  const router = useRouter();
  const isMobile = useIsMobile();

  // 2. Local State
  const [lat, setLat] = useState<number | null>(null);
  const [lon, setLon] = useState<number | null>(null);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const currentPage = 0;

  // 3. Navigation Handlers
  const handleProfileClick = () => {
    // If the hook is still checking localStorage, do nothing
    if (isLoading) return;

    if (user) {
      router.push("/profile");
    } else {
      router.push("/login");
    }
  };

  const handleSearchSubmit = (options?: { queryOverride?: string; amenity?: string }) => {
    const query = options?.queryOverride ?? searchInput;
    const amenity = options?.amenity;
    const params = new URLSearchParams();

    if (query.trim()) params.append("q", query);
    if (amenity) params.append("amenity", amenity);
    if (lat && lon) {
      params.append("lat", lat.toString());
      params.append("lon", lon.toString());
    }

    if (!query.trim() && !amenity) return;
    router.push(`/search?${params.toString()}`);
  };

  // 4. Effects & Callbacks
  const getUserLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(position.coords.latitude);
        setLon(position.coords.longitude);
      },
      (error) => console.error("Location error:", error)
    );
  };

  useEffect(() => {
    getUserLocation();
  }, []);

  const handleSelectVenue = useCallback((venue: Venue) => {
    setSelectedVenue((prev) => (prev?.id === venue.id ? null : venue));
    setMobileMenuOpen(false);
  }, []);

  return (
    <div className="flex h-dvh w-full flex-col overflow-hidden lg:flex-row">
      
      {/* Sidebar: Desktop */}
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

      {/* Sidebar: Mobile (Sheet) */}
      <Sheet open={isMobile && mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="z-1200 w-80 p-0 sm:max-w-80">
          <SheetTitle className="sr-only">Recent Searches</SheetTitle>
          <SheetDescription className="sr-only">
            Browse your recent venue searches.
          </SheetDescription>
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

      {/* Main Content (Map & Floating UI) */}
      <main id="main-content" className="relative flex-1">
        
        {/* Top UI Overlay */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-1100 flex items-start justify-between gap-3 p-4">
          
          {/* Mobile Menu Trigger */}
          <Button
            variant="outline"
            size="icon-lg"
            aria-label="Open menu"
            className="pointer-events-auto size-12 shrink-0 rounded-lg bg-card shadow-md lg:hidden"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="size-5 text-foreground" />
          </Button>

          {/* Search Bar */}
          <div className="pointer-events-auto flex-1">
            <MapSearchBar
              searchQuery={searchInput}
              onSearchChange={setSearchInput}
              onSearchSubmit={handleSearchSubmit}
            />
          </div>

          {/* Profile Action Button */}
          <Button
            variant="outline"
            size="icon-lg"
            aria-label={user ? "View Profile" : "Log In"}
            className="pointer-events-auto !pointer-events-auto relative z-[100000] size-12 shrink-0 rounded-lg bg-card shadow-md"
            onClick={handleProfileClick}
            // disabled={isLoading} // Disable interaction while auth is loading
          >
            <User className={`size-5 ${user ? "text-primary" : "text-foreground"}`} />
          </Button>
        </div>

        {/* Fullscreen Map */}
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