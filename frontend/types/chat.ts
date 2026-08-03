/**
 * types/chat.ts
 * Shared TypeScript types for the chat and itinerary modules.
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
