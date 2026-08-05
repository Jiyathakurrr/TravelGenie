"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";

const FAQS = [
  {
    q: "Is Travel Genie free to use?",
    a: "Yes, planning your trip — chatting with the AI, generating itineraries, and exploring destinations — is completely free. A Supabase account is required to save bookings.",
  },
  {
    q: "Does Travel Genie use real flight and hotel data?",
    a: "For the current MVP, Travel Genie uses mock local data to simulate flight and hotel options. This is because Amadeus self-service APIs were decommissioned on July 17, 2026. Real API integrations are planned for the next phase.",
  },
  {
    q: "Are payments real?",
    a: "No. Travel Genie uses Razorpay Test Mode exclusively — no real card or UPI data is ever processed. The checkout is a simulation only, designed to demonstrate the booking flow.",
  },
  {
    q: "Will Travel Genie automatically book my trip?",
    a: "Never. You must click 'Confirm & Book' yourself. The AI only suggests itineraries and options — every booking action requires your explicit approval.",
  },
  {
    q: "What if my budget doesn't cover flights?",
    a: "Travel Genie flags the overage and offers train alternatives as a suggestion. It will never automatically switch your transport — you choose whether to switch after reviewing the options.",
  },
  {
    q: "Which AI powers the chatbot?",
    a: "The chatbot and itinerary generation are powered by Kimi (Moonshot AI), using their OpenAI-compatible API. It supports long context windows for detailed, multi-day trip planning.",
  },
];

export default function FAQAccordion() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="space-y-3">
      {FAQS.map((faq, i) => (
        <div
          key={i}
          style={{
            backgroundColor: open === i ? "var(--color-white)" : "var(--color-cream)",
            border: `1px solid ${open === i ? "var(--color-border-dark)" : "var(--color-border)"}`,
            borderRadius: "var(--radius-md)",
          }}
          className="transition-all duration-200"
        >
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between px-6 py-5 text-left"
          >
            <span
              className="text-base font-medium pr-4"
              style={{ color: "var(--color-primary)", fontFamily: "var(--font-body)" }}
            >
              {faq.q}
            </span>
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors"
              style={{
                backgroundColor: open === i ? "var(--color-accent)" : "var(--color-surface)",
                color: open === i ? "white" : "var(--color-secondary)",
              }}
            >
              {open === i ? <Minus size={14} /> : <Plus size={14} />}
            </div>
          </button>
          {open === i && (
            <div className="px-6 pb-5">
              <p className="text-sm leading-relaxed" style={{ color: "var(--color-secondary)" }}>
                {faq.a}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
