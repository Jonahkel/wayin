"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import type { Venue } from "@/components/venue-card";

interface VenueContextType {
  recentVenues: Venue[];
  addVenue: (venue: Venue) => void;
  clearVenues: () => void;
}

const VenueContext = createContext<VenueContextType | undefined>(undefined);

export function VenueProvider({ children }: { children: ReactNode }) {
  const [recentVenues, setRecentVenues] = useState<Venue[]>([]);

  const addVenue = (venue: Venue) => {
    setRecentVenues((prev) => {
      // Prevent duplicates: remove the venue if it exists, then add to the front
      const filtered = prev.filter((v) => v.id !== venue.id);
      return [venue, ...filtered].slice(0, 10); // Keep only the 10 most recent
    });
  };

  const clearVenues = () => setRecentVenues([]);

  return (
    <VenueContext.Provider value={{ recentVenues, addVenue, clearVenues }}>
      {children}
    </VenueContext.Provider>
  );
}

// Custom hook for easy access
export function useVenues() {
  const context = useContext(VenueContext);
  if (context === undefined) {
    throw new Error("useVenues must be used within a VenueProvider");
  }
  return context;
}