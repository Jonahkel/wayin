"use client"

import { useEffect, useRef, useCallback } from "react"
import type { Venue } from "@/components/venue-card"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

interface VenueMapProps {
  venues: Venue[]
  selectedVenue: Venue | null
  onSelectVenue: (venue: Venue) => void
}

const DEFAULT_CENTER: [number, number] = [42.2808, -83.743]
const DEFAULT_ZOOM = 15

function createMarkerIcon(isSelected: boolean): L.DivIcon {
  const bg = isSelected ? "#2d3a4a" : "#c0392b"
  const size = isSelected ? 36 : 28
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="
      width: ${size}px;
      height: ${size}px;
      background: ${bg};
      border: 3px solid #fff;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  })
}

export function VenueMap({
  venues,
  selectedVenue,
  onSelectVenue,
}: VenueMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<Map<string, L.Marker>>(new Map())

  const onSelectVenueRef = useRef(onSelectVenue)
  useEffect(() => {
    onSelectVenueRef.current = onSelectVenue
  }, [onSelectVenue])

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    const map = L.map(mapContainerRef.current, {
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: true,
      attributionControl: true,
      keyboard: true,
      scrollWheelZoom: true,
    })

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map)

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  // Update markers when venues change
  const updateMarkers = useCallback(() => {
    const map = mapRef.current
    if (!map) return

    // Remove old markers
    markersRef.current.forEach((marker) => marker.remove())
    markersRef.current.clear()

    venues.forEach((venue) => {
      const isSelected = selectedVenue?.id === venue.id
      const marker = L.marker([venue.lat, venue.lng], {
        icon: createMarkerIcon(isSelected),
        title: venue.name,
        alt: `${venue.name} location marker`,
      })

      marker.bindPopup(
        `<div style="min-width: 140px; font-family: system-ui, sans-serif;">
          <strong style="font-size: 14px;">${venue.name}</strong>
          <p style="font-size: 12px; margin: 4px 0 0; color: #555;">${venue.description || venue.address}</p>
        </div>`,
        { closeButton: true }
      )

      marker.on("click", () => {
        onSelectVenueRef.current(venue)
      })

      marker.addTo(map)
      markersRef.current.set(venue.id, marker)
    })
  }, [venues, selectedVenue])

  useEffect(() => {
    updateMarkers()
  }, [updateMarkers])

  // Pan to selected venue
  useEffect(() => {
    if (!selectedVenue || !mapRef.current) return
    const marker = markersRef.current.get(selectedVenue.id)
    if (marker) {
      mapRef.current.panTo([selectedVenue.lat, selectedVenue.lng], {
        animate: true,
        duration: 0.5,
      })
      marker.openPopup()
    }
  }, [selectedVenue])

  return (
    <div
      ref={mapContainerRef}
      role="application"
      aria-label="Interactive map showing venue locations in Ann Arbor"
      aria-roledescription="map"
      className="size-full"
      style={{ minHeight: "300px" }}
    />
  )
}
