"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { Lock, Loader2, MapPin, Calendar, Users, Trash2, ArrowUpRight } from "lucide-react";
import type { User } from "@supabase/supabase-js";

interface SavedTrip {
  id: string;
  destination: string;
  source: string;
  start_date: string;
  end_date: string;
  travelers: number;
  budget_inr: number;
  transport_type: string;
  created_at: string;
}

export default function BookingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [trips, setTrips] = useState<SavedTrip[]>([]);
  const [fetchingTrips, setFetchingTrips] = useState(false);

  useEffect(() => {
    async function checkAuthAndLoadTrips() {
      try {
        const { supabaseBrowser } = await import("@/lib/supabase");
        const { data } = await supabaseBrowser.auth.getUser();
        setUser(data.user);

        if (data.user) {
          setFetchingTrips(true);
          const { data: sessionData } = await supabaseBrowser.auth.getSession();
          const token = sessionData.session?.access_token;

          if (token) {
            const res = await fetch("/api/trips", {
              headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
              const result = await res.json();
              setTrips(result.trips || []);
            }
          }
        }
      } catch (err) {
        console.error("Bookings auth error:", err);
      } finally {
        setLoading(false);
        setFetchingTrips(false);
      }
    }
    checkAuthAndLoadTrips();
  }, []);

  async function handleDeleteTrip(id: string) {
    try {
      const { supabaseBrowser } = await import("@/lib/supabase");
      const { data: sessionData } = await supabaseBrowser.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) return;

      const res = await fetch(`/api/trips?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setTrips((prev) => prev.filter((t) => t.id !== id));
      }
    } catch (err) {
      console.error("Delete trip error:", err);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--color-cream)" }}>
        <Navbar />
        <main className="flex-1 flex items-center justify-center pt-24 pb-12">
          <Loader2 size={32} className="animate-spin text-[var(--color-accent)]" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--color-cream)" }}>
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-6 pt-24 pb-12">
          <div
            className="max-w-md w-full p-12 rounded-[var(--radius-xl)] text-center"
            style={{ backgroundColor: "var(--color-white)", border: "1px solid var(--color-border)", boxShadow: "var(--shadow-lg)" }}
          >
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ backgroundColor: "var(--color-cream)", color: "var(--color-accent)" }}
            >
              <Lock size={24} />
            </div>
            <h1 className="text-3xl mb-3" style={{ fontFamily: "var(--font-display)" }}>
              My Bookings & Saved Trips
            </h1>
            <p className="text-sm mb-8" style={{ color: "var(--color-secondary)" }}>
              Sign in to view your saved itineraries and past bookings.
            </p>
            <div className="flex flex-col gap-3">
              <Link
                href="/login?redirect=/bookings"
                className="w-full py-3 rounded-[var(--radius-md)] text-sm font-semibold text-center transition-all active:scale-95 text-white"
                style={{ backgroundColor: "var(--color-accent)" }}
              >
                Sign In
              </Link>
              <Link href="/signup?redirect=/bookings" className="text-sm font-medium" style={{ color: "var(--color-accent)" }}>
                Create an account →
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--color-cream)" }}>
      <Navbar />
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 pt-28 pb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-normal" style={{ fontFamily: "var(--font-display)" }}>
              My Saved Trips
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Logged in as <strong className="text-gray-900">{user.email}</strong>
            </p>
          </div>
          <Link
            href="/plan"
            className="px-6 py-2.5 rounded-full text-xs font-semibold text-white shadow-sm transition-all hover:brightness-110 active:scale-95"
            style={{ backgroundColor: "var(--color-accent)" }}
          >
            + Plan New Trip
          </Link>
        </div>

        {fetchingTrips ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-[var(--color-accent)]" />
          </div>
        ) : trips.length === 0 ? (
          <div className="bg-white rounded-[var(--radius-xl)] p-12 text-center border border-[var(--color-border)] shadow-sm">
            <MapPin size={40} className="mx-auto text-[var(--color-accent)] opacity-60 mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">No saved trips yet</h3>
            <p className="text-sm text-gray-600 max-w-sm mx-auto mb-6">
              Create an AI-crafted itinerary for your dream Indian destination and save it to your account.
            </p>
            <Link
              href="/plan"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-semibold text-white"
              style={{ backgroundColor: "var(--color-accent)" }}
            >
              Start Planning <ArrowUpRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-6">
            {trips.map((trip) => (
              <div
                key={trip.id}
                className="bg-white rounded-[var(--radius-lg)] p-6 border border-[var(--color-border)] shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      {trip.transport_type || "Flight"} Plan
                    </span>
                    <button
                      onClick={() => handleDeleteTrip(trip.id)}
                      className="text-gray-400 hover:text-red-600 p-1 transition-colors"
                      title="Delete trip"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <h3 className="text-2xl font-normal text-gray-900 mb-2" style={{ fontFamily: "var(--font-display)" }}>
                    {trip.source || "Mumbai"} → {trip.destination}
                  </h3>
                  <div className="space-y-1.5 text-xs text-gray-600 mb-4">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={13} className="text-gray-400" />
                      <span>{trip.start_date || "Upcoming"} ({trip.end_date || "4 Days"})</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users size={13} className="text-gray-400" />
                      <span>{trip.travelers || 2} Travellers</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[var(--color-border)] flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-gray-500 block">Est. Budget</span>
                    <span className="text-base font-bold text-[var(--color-accent)]">
                      ₹{(trip.budget_inr || 30000).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <Link
                    href={`/plan?dest=${encodeURIComponent(trip.destination)}`}
                    className="text-xs font-semibold text-[var(--color-accent)] hover:underline flex items-center gap-1"
                  >
                    View Plan <ArrowUpRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
