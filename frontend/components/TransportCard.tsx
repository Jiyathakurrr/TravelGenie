/**
 * components/TransportCard.tsx
 * Shown when itinerary exceeds budget.
 * Presents train alternatives and requires EXPLICIT user confirmation before switching.
 * Never auto-swaps transport mode.
 */
"use client";

import { AlertTriangle, Train, Check, X } from "lucide-react";
import type { TrainOption } from "@/types/chat";

interface Props {
  overageINR: number;
  trainOptions: TrainOption[];
  onConfirmSwitch: (selectedTrain: TrainOption) => void;
  onDecline: () => void;
}

function formatINR(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}

export default function TransportCard({ overageINR, trainOptions, onConfirmSwitch, onDecline }: Props) {
  return (
    <div
      className="rounded-[var(--radius-lg)] overflow-hidden border"
      style={{ borderColor: "#FEA500", backgroundColor: "var(--color-white)" }}
    >
      {/* Header */}
      <div className="flex items-start gap-3 px-5 py-4" style={{ backgroundColor: "#FFF8EE" }}>
        <AlertTriangle size={20} className="shrink-0 mt-0.5" style={{ color: "#C87000" }} />
        <div>
          <p className="text-sm font-semibold" style={{ color: "#7A4500" }}>
            Budget exceeded by {formatINR(overageINR)}
          </p>
          <p className="text-xs mt-1" style={{ color: "#9A6A00" }}>
            Flights + hotels exceed your budget. Here are train alternatives — you decide whether to switch.
          </p>
        </div>
      </div>

      {/* Train Options */}
      <div className="p-4 space-y-3">
        {trainOptions.length === 0 && (
          <p className="text-sm text-center py-4" style={{ color: "var(--color-muted)" }}>
            No train alternatives available for this route.
          </p>
        )}

        {trainOptions.map((train) => (
          <div
            key={train.id}
            className="flex items-center justify-between p-4 rounded-[var(--radius-md)] border"
            style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-cream)" }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "var(--color-accent)", color: "white" }}
              >
                <Train size={16} />
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--color-primary)" }}>
                  {train.trainName}
                </p>
                <p className="text-xs" style={{ color: "var(--color-muted)" }}>
                  {train.from} → {train.to} · {train.duration} · #{train.trainNumber}
                </p>
                <p className="text-xs font-medium mt-0.5" style={{ color: "var(--color-accent)" }}>
                  Sleeper: {formatINR(train.priceINR.sleeper)} · 3AC: {formatINR(train.priceINR.ac3Tier)}
                </p>
              </div>
            </div>
            <button
              onClick={() => onConfirmSwitch(train)}
              className="text-xs font-semibold px-4 py-2 rounded-full transition-all active:scale-95"
              style={{
                backgroundColor: "var(--color-accent)",
                color: "var(--color-white)",
              }}
            >
              <span className="flex items-center gap-1.5">
                <Check size={13} />
                Switch
              </span>
            </button>
          </div>
        ))}
      </div>

      {/* Decline */}
      <div className="px-5 py-4 border-t" style={{ borderColor: "var(--color-border)" }}>
        <button
          onClick={onDecline}
          className="flex items-center gap-2 text-sm font-medium transition-colors"
          style={{ color: "var(--color-secondary)" }}
        >
          <X size={15} />
          No, keep flights as planned
        </button>
      </div>
    </div>
  );
}
