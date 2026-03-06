"use client"

import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"

interface MapSearchBarProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  onSearchSubmit: () => void
}

export function MapSearchBar({
  searchQuery,
  onSearchChange,
  onSearchSubmit,
}: MapSearchBarProps) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSearchSubmit()
      }}
      className="pointer-events-auto flex w-full max-w-xl items-center gap-2"
    >
      <div className="relative flex-1">
        <label htmlFor="map-search" className="sr-only">
          Search for venues
        </label>

        <Search
          className="absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />

        <input
          id="map-search"
          type="search"
          placeholder="Search"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-12 w-full rounded-lg border border-border bg-card pl-11 pr-4 text-base text-foreground shadow-md placeholder:text-muted-foreground transition-shadow focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
        />
      </div>

      <Button
        type="submit"
        variant="outline"
        size="icon-lg"
        aria-label="Submit search"
        className="size-12 shrink-0 rounded-lg bg-card shadow-md"
      >
        <Search className="size-5 text-muted-foreground" />
      </Button>
    </form>
  )
}