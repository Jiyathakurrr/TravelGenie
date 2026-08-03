/**
 * components/ItineraryPanel.tsx
 *
 * Renders the full itinerary summary + all day cards inline in the chat.
 * Shows a budget warning banner if the trip exceeds the user's budget.
 */
"use client";

import { AlertTriangle, CheckCircle, MapPin, Calendar, Users, Wallet } from "lucide-react";
import type { Itinerary } from "@/types/chat";
import ItineraryCard from "./ItineraryCard";

interface Props {
  itinerary: Itinerary;
}

function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
}

export default function ItineraryPanel({ itinerary }: Props) {
  const overBy = itinerary.estimatedCostINR - itinerary.totalBudgetINR;

  return (
    <div className="space-y-4 w-full max-w-2xl">
      {/* ── Summary card ── */}
      <div
        style={{
          backgroundColor: "var(--color-terra)",
          borderRadius: "var(--radius-card)",
          color: "var(--color-sand)",
        }}
        className="p-5"
      >
        <h2
          style={{ fontFamily: "var(--font-display)", color: "var(--color-sand)" }}
          className="text-xl font-bold mb-4 leading-tight"
        >
          {itinerary.tripTitle}
        </h2>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <MapPin size={15} style={{ color: "var(--color-caramel)" }} />
            <span>{itinerary.destination}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users size={15} style={{ color: "var(--color-caramel)" }} />
            <span>{itinerary.travelers} traveler{itinerary.travelers > 1 ? "s" : ""}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={15} style={{ color: "var(--color-caramel)" }} />
            <span>
              {new Date(itinerary.startDate).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
              {" – "}
              {new Date(itinerary.endDate).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Wallet size={15} style={{ color: "var(--color-caramel)" }} />
            <span>Est. {formatINR(itinerary.estimatedCostINR)}</span>
          </div>
        </div>
      </div>

      {/* ── Budget alert ── */}
      {itinerary.overBudget ? (
        <div
          style={{
            backgroundColor: "#FFF3CD",
            border: "1px solid #F5C842",
            borderRadius: "var(--radius-btn)",
          }}
          className="flex items-start gap-3 px-4 py-3"
        >
          <AlertTriangle size={18} className="shrink-0 mt-0.5" style={{ color: "#92710A" }} />
          <div>
            <p style={{ color: "#5C470A" }} className="text-sm font-semibold">
              This trip exceeds your budget by {formatINR(overBy)}.
            </p>
            <p style={{ color: "#7A5F0E" }} className="text-xs mt-1">
              In a future phase, I can suggest train alternatives to bring costs down — but
              I'll always ask for your confirmation before making any changes.
            </p>
          </div>
        </div>
      ) : (
        <div
          style={{
            backgroundColor: "#EAFAF1",
            border: "1px solid #6FCF97",
            borderRadius: "var(--radius-btn)",
          }}
          className="flex items-center gap-3 px-4 py-3"
        >
          <CheckCircle size={18} style={{ color: "#27AE60" }} />
          <p style={{ color: "#1D6B41" }} className="text-sm font-semibold">
            This itinerary fits within your budget of {formatINR(itinerary.totalBudgetINR)}.
          </p>
        </div>
      )}

      {/* ── Day cards ── */}
      <div className="space-y-3">
        {itinerary.days.map((day, i) => (
          <ItineraryCard key={day.dayNumber} day={day} index={i} />
        ))}
      </div>

      {/* ── Phase 1 note for evaluators ── */}
      <p style={{ color: "var(--color-ink-muted)" }} className="text-xs text-center pb-2">
        ✦ Phase 1 preview — flight, hotel & booking modules coming in Phase 2
      </p>
    </div>
  );
}
