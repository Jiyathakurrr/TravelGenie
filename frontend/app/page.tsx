/**
 * app/page.tsx
 *
 * TravelGenie landing page.
 *
 * Structure (MakeMyTrip inspired):
 * 1. Navbar
 * 2. Hero — prominent, centered chatbot entry point
 * 3. Features strip — 3 value props
 * 4. How it works — 3 steps
 * 5. Footer
 */
import Link from "next/link";
import { Plane, MessageSquare, Wallet, Shield } from "lucide-react";
import Navbar from "@/components/Navbar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TravelGenie — Your AI Travel Companion",
  description:
    "Plan smarter trips with AI. Get personalised itineraries, budget-aware suggestions, and seamless booking — all in a warm, conversational interface.",
};

// ── Feature cards data ─────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: <MessageSquare size={22} />,
    title: "Conversational Planning",
    desc: "Just talk to us. Our AI concierge asks the right questions to build your perfect trip.",
  },
  {
    icon: <Wallet size={22} />,
    title: "Budget-Aware Itineraries",
    desc: "Every plan is crafted within your stated budget, with transparent cost breakdowns per day.",
  },
  {
    icon: <Shield size={22} />,
    title: "Safety & Seasonality Insights",
    desc: "We surface real-time safety advisories and weather info so you're never caught off guard.",
  },
];

const STEPS = [
  { num: "01", title: "Chat with TravelGenie", desc: "Tell us where, when, how many, and how much — in plain language." },
  { num: "02", title: "Get your itinerary", desc: "Receive a beautiful day-by-day plan with activities, costs, and timings." },
  { num: "03", title: "Review & Book", desc: "Browse options, compare prices, and confirm with a single tap — no auto-booking ever." },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div style={{ backgroundColor: "var(--color-sand)" }} className="min-h-screen flex flex-col">
      <Navbar />

      {/* ── Hero ── */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 mb-6">
            <span
              style={{
                backgroundColor: "var(--color-terra)",
                color: "var(--color-sand)",
              }}
              className="rounded-full p-2"
            >
              <Plane size={16} />
            </span>
            <span
              style={{ color: "var(--color-terra)", fontFamily: "var(--font-body)" }}
              className="text-sm font-semibold tracking-wide uppercase"
            >
              AI-Powered Travel Planning
            </span>
          </div>

          {/* Heading */}
          <h1
            style={{ fontFamily: "var(--font-display)", color: "var(--color-terra)" }}
            className="text-5xl sm:text-6xl font-bold mb-6 leading-tight"
          >
            Your next adventure,
            <br />
            <span style={{ color: "var(--color-caramel)" }}>intelligently planned.</span>
          </h1>

          <p
            style={{ color: "var(--color-ink-muted)", fontFamily: "var(--font-body)" }}
            className="text-lg sm:text-xl mb-10 max-w-xl mx-auto leading-relaxed"
          >
            TravelGenie is your AI travel concierge — generating personalised,
            budget-aware itineraries through a warm, conversational experience.
          </p>

          {/* Primary CTA */}
          <Link
            href="/chat"
            style={{
              backgroundColor: "var(--color-terra)",
              color: "var(--color-sand)",
              fontFamily: "var(--font-body)",
            }}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-[var(--radius-btn)]
                       text-base font-semibold shadow-[var(--shadow-card)]
                       hover:bg-[var(--color-terra-dark)] hover:shadow-[var(--shadow-lift)]
                       active:scale-95 transition-all"
          >
            <MessageSquare size={18} />
            Start Planning Your Trip
          </Link>

          <p
            style={{ color: "var(--color-ink-muted)" }}
            className="text-sm mt-4"
          >
            Free to use · No account needed to explore
          </p>
        </div>
      </section>

      {/* ── Features ── */}
      <section
        style={{ backgroundColor: "var(--color-surface)", borderTop: "1px solid var(--color-sand-dark)" }}
        className="px-4 py-16"
      >
        <div className="max-w-5xl mx-auto">
          <h2
            style={{ fontFamily: "var(--font-display)", color: "var(--color-terra)" }}
            className="text-3xl font-bold text-center mb-10"
          >
            Why TravelGenie?
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                style={{
                  backgroundColor: "var(--color-sand)",
                  border: "1px solid var(--color-sand-dark)",
                  borderRadius: "var(--radius-card)",
                  boxShadow: "var(--shadow-card)",
                }}
                className="p-6 group hover:shadow-[var(--shadow-lift)] transition-shadow"
              >
                <div
                  style={{ backgroundColor: "var(--color-terra)", color: "var(--color-sand)" }}
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4
                             group-hover:scale-110 transition-transform"
                >
                  {f.icon}
                </div>
                <h3
                  style={{ fontFamily: "var(--font-display)", color: "var(--color-terra)" }}
                  className="text-lg font-semibold mb-2"
                >
                  {f.title}
                </h3>
                <p style={{ color: "var(--color-ink-muted)" }} className="text-sm leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h2
            style={{ fontFamily: "var(--font-display)", color: "var(--color-terra)" }}
            className="text-3xl font-bold text-center mb-12"
          >
            How it works
          </h2>
          <div className="grid sm:grid-cols-3 gap-8 relative">
            {/* connector line (desktop) */}
            <div
              style={{ backgroundColor: "var(--color-sand-dark)" }}
              className="hidden sm:block absolute top-7 left-[16.6%] right-[16.6%] h-px"
            />
            {STEPS.map((step) => (
              <div key={step.num} className="flex flex-col items-center text-center gap-4">
                <div
                  style={{
                    backgroundColor: "var(--color-terra)",
                    color: "var(--color-sand)",
                    fontFamily: "var(--font-display)",
                  }}
                  className="w-14 h-14 rounded-full flex items-center justify-center
                             text-xl font-bold shadow-[var(--shadow-card)] z-10"
                >
                  {step.num}
                </div>
                <h3
                  style={{ fontFamily: "var(--font-display)", color: "var(--color-terra)" }}
                  className="text-lg font-semibold"
                >
                  {step.title}
                </h3>
                <p style={{ color: "var(--color-ink-muted)" }} className="text-sm leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/chat"
              style={{
                color: "var(--color-terra)",
                border: "2px solid var(--color-terra)",
                fontFamily: "var(--font-body)",
              }}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-[var(--radius-btn)]
                         text-sm font-semibold hover:bg-[var(--color-terra)] hover:text-[var(--color-sand)]
                         active:scale-95 transition-all"
            >
              Get started — it&apos;s free
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        style={{
          backgroundColor: "var(--color-terra)",
          color: "var(--color-sand)",
          fontFamily: "var(--font-body)",
        }}
        className="px-4 py-8 text-center text-sm"
      >
        <div className="flex items-center justify-center gap-2 mb-3">
          <Plane size={16} />
          <span style={{ fontFamily: "var(--font-display)" }} className="text-base font-bold">
            TravelGenie
          </span>
        </div>
        <p style={{ color: "rgba(234,206,170,0.7)" }}>
          A university capstone project. Powered by Kimi AI (Moonshot AI) · Payments via Razorpay Test Mode only.
        </p>
        <p style={{ color: "rgba(234,206,170,0.5)" }} className="mt-1 text-xs">
          © 2026 TravelGenie · MIT License
        </p>
      </footer>
    </div>
  );
}
