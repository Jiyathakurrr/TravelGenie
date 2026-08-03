/**
 * app/bookings/page.tsx
 *
 * My Bookings page — Phase 1 placeholder.
 * Auth + booking persistence added in Phase 2 (Supabase Auth integration).
 */
import Navbar from "@/components/Navbar";
import { Lock } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Bookings — TravelGenie",
};

export default function BookingsPage() {
  return (
    <div style={{ backgroundColor: "var(--color-sand)" }} className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-20">
        <div
          style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-sand-dark)",
            borderRadius: "var(--radius-card)",
            boxShadow: "var(--shadow-card)",
          }}
          className="max-w-md w-full p-10 text-center"
        >
          <div
            style={{ backgroundColor: "var(--color-terra)", color: "var(--color-sand)" }}
            className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Lock size={24} />
          </div>
          <h1
            style={{ fontFamily: "var(--font-display)", color: "var(--color-terra)" }}
            className="text-2xl font-bold mb-3"
          >
            Coming in Phase 2
          </h1>
          <p style={{ color: "var(--color-ink-muted)" }} className="text-sm leading-relaxed mb-6">
            Booking history and saved itineraries require a TravelGenie account.
            Authentication (Supabase Auth) and booking persistence are being built in Phase 2.
          </p>
          <Link
            href="/chat"
            style={{
              backgroundColor: "var(--color-terra)",
              color: "var(--color-sand)",
              fontFamily: "var(--font-body)",
            }}
            className="inline-block px-6 py-3 rounded-[var(--radius-btn)] text-sm font-semibold
                       hover:bg-[var(--color-terra-dark)] active:scale-95 transition-all"
          >
            Start planning a trip →
          </Link>
        </div>
      </main>
    </div>
  );
}
