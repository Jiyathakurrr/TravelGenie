/**
 * lib/db.ts
 * Database access layer for TravelGenie.
 * Queries Supabase database tables with local seeded fallback.
 */

import { supabaseBrowser } from "./supabase";
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
  try {
    const { data, error } = await supabaseBrowser
      .from("destinations")
      .select("*");
    if (!error && data && data.length > 0) {
      return data.map((d) => ({
        slug: d.slug,
        name: d.name,
        state: d.state,
        region: d.region,
        popular_for: d.popular_for,
        description: d.description,
        heroImage: d.hero_image,
        rating: d.rating,
        reviewCount: d.review_count,
        startingPriceINR: d.starting_price_inr,
        bestTimeToVisit: d.best_time_to_visit,
        experiences: d.experiences || [],
        general_safety_score: d.general_safety_score || 4.5,
        girls_trip_safety_score: d.girls_trip_safety_score || 4.4,
        safety_note: d.safety_note || "Exercise standard tourist precautions.",
      }));
    }
  } catch (err) {
    // Fall back to seeded json
  }
  return destinationsData as DBDestination[];
}

export async function findDestination(queryName: string): Promise<DBDestination | null> {
  if (!queryName || queryName.trim().length < 2) return null;
  const q = queryName.toLowerCase().trim();
  const all = await getAllDestinations();

  // Exact or partial match on city name or slug
  const matched = all.find(
    (d) =>
      d.name.toLowerCase() === q ||
      d.slug.toLowerCase() === q ||
      d.name.toLowerCase().includes(q) ||
      q.includes(d.name.toLowerCase())
  );
  return matched || null;
}

export async function getSafetyAdvisory(destinationName: string): Promise<SafetyAdvisory> {
  const dest = await findDestination(destinationName);
  const genScore = dest?.general_safety_score ?? 4.5;
  const girlsScore = dest?.girls_trip_safety_score ?? 4.4;
  const note = dest?.safety_note ?? "Exercise standard precautions in busy areas.";

  return {
    destination: dest?.name || destinationName,
    general_safety_score: genScore,
    girls_trip_safety_score: girlsScore,
    source_note: note,
    disclaimer: DISCLAIMER_NOTE,
  };
}

export function generateRouteOptions(source: string, destination: string, travelers = 1): TransportRouteOption[] {
  const src = source || "Delhi";
  const dst = destination || "Goa";

  return [
    {
      mode: "Flight",
      provider: "IndiGo / Air India",
      duration: "2h 15m",
      departureTime: "08:30 AM",
      arrivalTime: "10:45 AM",
      costPerPersonINR: 4800,
      totalCostINR: 4800 * travelers,
      availabilityNote: "estimated availability",
    },
    {
      mode: "Train",
      provider: "Rajdhani / Shatabdi Express (3AC)",
      duration: "11h 30m",
      departureTime: "07:15 PM",
      arrivalTime: "06:45 AM (+1 day)",
      costPerPersonINR: 1450,
      totalCostINR: 1450 * travelers,
      availabilityNote: "estimated availability",
    },
    {
      mode: "Bus",
      provider: "AC Volvo Sleeper Bus",
      duration: "13h 00m",
      departureTime: "08:00 PM",
      arrivalTime: "09:00 AM (+1 day)",
      costPerPersonINR: 950,
      totalCostINR: 950 * travelers,
      availabilityNote: "estimated availability",
    },
    {
      mode: "Car / Cab",
      provider: "Private Outstation SUV Cab",
      duration: "10h 30m",
      departureTime: "Flexible (On-demand)",
      arrivalTime: "Flexible",
      costPerPersonINR: Math.round(7500 / Math.max(1, travelers)),
      totalCostINR: 7500,
      availabilityNote: "estimated availability",
    },
  ];
}
