import type { Venue } from "@/components/venue-card";

// Hardcoded data for now
let VENUES: Venue[] = [
  {
    id: "1",
    name: "Condado Tacos",
    address: "401 E Liberty St #200",
    city: "Ann Arbor",
    state: "MI",
    zip: "48104",
    reviewCount: 3,
    imageUrl:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-JZpwo9iKYkERZzsXyHovMpxHNh6LkG.png",
    imageAlt: "Interior of Condado Tacos restaurant with vibrant decor",
    lat: 42.2808,
    lng: -83.7462,
    description: "Ultimate Queso & Guac Flight",
  },
  {
    id: "2",
    name: "Ashley's",
    address: "338 S State St",
    city: "Ann Arbor",
    state: "MI",
    zip: "48104",
    reviewCount: 5,
    imageUrl:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-JZpwo9iKYkERZzsXyHovMpxHNh6LkG.png",
    imageAlt: "Interior of Ashley's restaurant with warm ambient lighting",
    lat: 42.2776,
    lng: -83.7409,
    description: "Order Mains, Small Plates, Specialty Food",
  },
];

// “Get” function
export const getVenues = async (): Promise<Venue[]> => {
  // In the future: call Prisma client here
  return VENUES;
};

// “Set” function (fake for now)
export const addReviewToVenue = async (
  venueId: string,
  rating: number,
  comment: string
) => {
  const venue = VENUES.find((v) => v.id === venueId);
  if (!venue) throw new Error("Venue not found");

  venue.reviewCount += 1;

  // In the future, you'd insert a Review into the database
  return venue;
};
