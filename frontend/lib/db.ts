/**
 * lib/db.ts
 * Database access layer for TravelGenie.
 * Uses local seeded data fallback without Supabase dependencies.
 */

import destinationsData from "@/data/destinations.json";
import type { Destination } from "@/types/chat";

export interface DBDestination {
  slug: string;
  name: string;
  state: string;
  region: string;
  popular_for: string;
  description: string;
  heroImage: string;
  rating: number;
  reviewCount: number;
  startingPriceINR: number;
  bestTimeToVisit: string;
  experiences: string[];
  general_safety_score: number;
  girls_trip_safety_score: number;
  safety_note: string;
}

export interface SafetyAdvisory {
  destination: string;
  general_safety_score: number;
  girls_trip_safety_score: number;
  source_note: string;
  disclaimer: string;
}

export interface TransportRouteOption {
  mode: "Flight" | "Train" | "Bus" | "Car / Cab";
  provider: string;
  duration: string;
  departureTime: string;
  arrivalTime: string;
  costPerPersonINR: number;
  totalCostINR: number;
  availabilityNote: string;
}

export const DISCLAIMER_NOTE = "General guidance only, not a guarantee — always verify current conditions.";

export async function getAllDestinations(): Promise<DBDestination[]> {
  return (destinationsData as Destination[]).map((d) => ({
    slug: d.slug,
    name: d.name,
    state: "India",
    region: "India",
    popular_for: d.tagline || "Travel Destination",
    description: d.description,
    heroImage: d.heroImage,
    rating: d.rating,
    reviewCount: d.reviewCount,
    startingPriceINR: d.startingPriceINR,
    bestTimeToVisit: d.bestTimeToVisit,
    experiences: d.experiences,
    general_safety_score: 4.5,
    girls_trip_safety_score: 4.3,
    safety_note: "Generally safe for travelers. Standard safety precautions apply.",
  }));
}

export async function getDestinationBySlug(slug: string): Promise<DBDestination | null> {
  const all = await getAllDestinations();
  return all.find((d) => d.slug.toLowerCase() === slug.toLowerCase()) || null;
}

export async function getSafetyAdvisory(destinationName: string): Promise<SafetyAdvisory> {
  const match = (destinationsData as Destination[]).find(
    (d) => d.name.toLowerCase() === destinationName.toLowerCase()
  );

  return {
    destination: destinationName,
    general_safety_score: match ? 4.5 : 4.0,
    girls_trip_safety_score: match ? 4.3 : 3.8,
    source_note: "TravelGenie Safety Index",
    disclaimer: DISCLAIMER_NOTE,
  };
}
