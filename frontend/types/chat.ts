/**
 * types/chat.ts
 * Shared TypeScript types for the chat, search, booking, and itinerary modules.
 */

// ─── Chat ─────────────────────────────────────────────────────────────────────

export type MessageRole = "user" | "assistant" | "system";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  /** If present, an itinerary card is rendered inline after this message */
  itinerary?: Itinerary;
  createdAt: Date;
}

// ─── Trip Inputs ──────────────────────────────────────────────────────────────

export interface TripInputs {
  destination: string;
  startDate: string;   // ISO date string e.g. "2025-03-10"
  endDate: string;     // ISO date string
  travelers: number;   // number of people
  budgetINR: number;   // total trip budget in INR
  preferences?: string; // optional: "adventure", "relaxation", etc.
}

// ─── Itinerary ────────────────────────────────────────────────────────────────

export interface ItineraryActivity {
  time: string;          // e.g. "09:00"
  description: string;
  costEstimateINR: number;
  category: "transport" | "food" | "accommodation" | "sightseeing" | "leisure";
}

export interface ItineraryDay {
  dayNumber: number;
  date: string;          // ISO date
  theme: string;         // e.g. "Arrival & Old City Walk"
  activities: ItineraryActivity[];
  dayTotalINR: number;
}

export interface Itinerary {
  id: string;
  tripTitle: string;
  destination: string;
  startDate: string;
  endDate: string;
  travelers: number;
  totalBudgetINR: number;
  estimatedCostINR: number;
  overBudget: boolean;   // true if estimatedCost > totalBudget
  days: ItineraryDay[];
  generatedAt: string;   // ISO timestamp
}

// ─── API Payloads ─────────────────────────────────────────────────────────────

export interface ChatApiRequest {
  messages: { role: MessageRole; content: string }[];
  tripInputs?: Partial<TripInputs>; // accumulated so far from conversation
}

export interface ChatApiResponse {
  reply: string;
  tripInputs?: Partial<TripInputs>; // updated after extraction
  readyToGenerate: boolean;          // true when all required fields are collected
}

export interface ItineraryApiRequest {
  tripInputs: TripInputs;
}

export interface ItineraryApiResponse {
  itinerary: Itinerary;
}

// ─── Search & Options ─────────────────────────────────────────────────────────

export interface SearchRequest {
  from: string;
  to: string;
  checkIn: string;
  checkOut: string;
  travelers: number;
  budgetINR: number;
}

export interface FlightOption {
  id: string;
  airline: string;
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  priceINR: number;
  class: string;
}

export interface HotelOption {
  id: string;
  name: string;
  destination: string;
  starRating: number;
  pricePerNightINR: number;
  amenities: string[];
  description: string;
  available: boolean;
}

export interface TrainOption {
  id: string;
  trainName: string;
  trainNumber: string;
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  priceINR: {
    sleeper: number;
    ac3Tier: number;
    ac2Tier: number;
  };
  available: boolean;
}

export interface SearchResponse {
  flights: FlightOption[];
  hotels: HotelOption[];
  overBudget: boolean;
  budgetDiff?: number;
  trainAlternatives?: TrainOption[];
}

// ─── Safety & Weather ─────────────────────────────────────────────────────────

export interface SafetyWeatherRequest {
  destination: string;
  startDate: string;
  endDate: string;
}

export interface WeatherDay {
  date: string;
  tempMaxC: number;
  tempMinC: number;
  precipitationMm: number;
}

export interface SafetyWeatherResponse {
  safety: {
    score: number;
    message: string;
    source: string;
  } | null;
  weather: WeatherDay[] | null;
  warnings: string[];
}

// ─── Checkout & Booking ───────────────────────────────────────────────────────

export interface CheckoutRequest {
  amount: number;
  currency: string;
  receipt: string;
}

export interface CheckoutResponse {
  orderId: string;
  amount: number;
  currency: string;
  key: string;
}

export interface Booking {
  id: string;
  itineraryId: string;
  userId: string;
  totalINR: number;
  status: "pending" | "confirmed" | "failed" | "cancelled";
  razorpayOrderId?: string;
  createdAt: string;
}

// ─── Destination ──────────────────────────────────────────────────────────────

export interface Destination {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  heroImage: string;
  rating: number;
  reviewCount: number;
  startingPriceINR: number;
  bestTimeToVisit: string;
  experiences: string[];
}
