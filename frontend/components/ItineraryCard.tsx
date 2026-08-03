/**
 * components/ItineraryCard.tsx
 *
 * Renders a single day of the AI-generated itinerary as a rich card.
 * Displayed inline inside the chat conversation.
 */
"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Utensils, Landmark, Car, Hotel, Sunset } from "lucide-react";
import type { ItineraryDay, ItineraryActivity } from "@/types/chat";

interface Props {
  day: ItineraryDay;
  index: number;
}

const categoryIcon = (cat: ItineraryActivity["category"]) => {
  switch (cat) {
    case "food":          return <Utensils size={14} />;
    case "sightseeing":   return <Landmark size={14} />;
    case "transport":     return <Car size={14} />;
    case "accommodation": return <Hotel size={14} />;
    default:              return <Sunset size={14} />;
  }
};

const categoryColor = (cat: ItineraryActivity["category"]): string => {
  switch (cat) {
    case "food":          return "#D39858";
    case "sightseeing":   return "#85431E";
    case "transport":     return "#6B4226";
    case "accommodation": return "#B87E3A";
    default:              return "#A0522D";
  }
};

function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
}

export default function ItineraryCard({ day, index }: Props) {
  const [expanded, setExpanded] = useState(index === 0); // first day open by default

  return (
    <div
      style={{
        backgroundColor: "var(--color-surface)",
        border: "1px solid var(--color-sand-dark)",
        borderRadius: "var(--radius-card)",
        boxShadow: "var(--shadow-card)",
        overflow: "hidden",
      }}
      className="transition-shadow hover:shadow-[var(--shadow-lift)]"
    >
      {/* ── Day header ── */}
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
        style={{ backgroundColor: expanded ? "var(--color-terra)" : "var(--color-surface)" }}
      >
        <div className="flex items-center gap-3">
          <span
            style={{
              backgroundColor: expanded ? "rgba(255,255,255,0.2)" : "var(--color-terra)",
              color: expanded ? "var(--color-sand)" : "var(--color-sand)",
            }}
            className="text-xs font-bold px-2.5 py-1 rounded-full"
          >
            Day {day.dayNumber}
          </span>
          <div>
            <p
              style={{
                fontFamily: "var(--font-display)",
                color: expanded ? "var(--color-sand)" : "var(--color-terra)",
              }}
              className="text-base font-semibold leading-tight"
            >
              {day.theme}
            </p>
            <p
              style={{ color: expanded ? "rgba(234,206,170,0.8)" : "var(--color-ink-muted)" }}
              className="text-xs mt-0.5"
            >
              {new Date(day.date).toLocaleDateString("en-IN", {
                weekday: "long", month: "short", day: "numeric",
              })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span
            style={{
              color: expanded ? "var(--color-caramel)" : "var(--color-terra)",
              fontFamily: "var(--font-body)",
            }}
            className="text-sm font-semibold"
          >
            {formatINR(day.dayTotalINR)}
          </span>
          {expanded
            ? <ChevronUp size={18} color={expanded ? "var(--color-sand)" : "var(--color-terra)"} />
            : <ChevronDown size={18} color="var(--color-terra)" />
          }
        </div>
      </button>

      {/* ── Activity timeline ── */}
      {expanded && (
        <div className="px-5 py-4 space-y-3">
          {day.activities.map((activity, i) => (
            <div key={i} className="flex gap-3 items-start">
              {/* Time column */}
              <div className="w-14 shrink-0 text-right">
                <span style={{ color: "var(--color-caramel)", fontFamily: "var(--font-body)" }}
                  className="text-xs font-medium"
                >
                  {activity.time}
                </span>
              </div>

              {/* Dot + vertical line */}
              <div className="flex flex-col items-center">
                <div
                  style={{ backgroundColor: categoryColor(activity.category) }}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white shrink-0"
                >
                  {categoryIcon(activity.category)}
                </div>
                {i < day.activities.length - 1 && (
                  <div style={{ backgroundColor: "var(--color-sand-dark)" }} className="w-px flex-1 mt-1 min-h-[1.5rem]" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 pb-2">
                <p style={{ color: "var(--color-ink)" }} className="text-sm leading-snug">
                  {activity.description}
                </p>
                <p style={{ color: "var(--color-ink-muted)" }} className="text-xs mt-0.5">
                  {formatINR(activity.costEstimateINR)} · {activity.category}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
