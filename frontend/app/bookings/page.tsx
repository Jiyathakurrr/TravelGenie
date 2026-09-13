"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { Lock, Loader2, MapPin, Calendar, Users, Trash2, ArrowUpRight } from "lucide-react";
import { apiClient } from "@/lib/apiClient";

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
  const [user, setUser] = useState<{ email?: string; name?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [trips, setTrips] = useState<SavedTrip[]>([]);
  const [fetchingTrips, setFetchingTrips] = useState(false);

  useEffect(() => {
    async function checkAuthAndLoadTrips() {
      try {
        const token = localStorage.getItem("travelgenie_token");
        const storedUser = localStorage.getItem("travelgenie_user");

        if (token && storedUser) {
          setUser(JSON.parse(storedUser));
          setFetchingTrips(true);

          const res = await apiClient("/api/trips");
          setTrips(res.trips || []);
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
      await apiClient(`/api/trips/${id}`, { method: "DELETE" });
      setTrips((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error("Delete trip error:", err);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--color-bg)" }}>
        <Navbar />
        <main className="flex-1 flex items-center justify-center pt-28 pb-16">
          <Loader2 size={32} className="animate-spin text-gray-400" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--color-bg)" }}>
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 pt-28 pb-16">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: "var(--font-display)", color: "var(--color-primary)" }}>
              My Bookings & Saved Trips
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--color-muted)" }}>
              Manage your saved itineraries and travel bookings.
            </p>
          </div>
          <Link
            href="/plan"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-xs font-bold shadow-sm transition-all hover:opacity-95 self-start md:self-auto"
            style={{ backgroundColor: "var(--color-primary)" }}
          >
            + Plan New Trip
          </Link>
        </div>

        {!user ? (
          <div className="bg-white rounded-2xl p-12 text-center border space-y-4" style={{ borderColor: "var(--color-border)" }}>
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <Lock size={24} />
            </div>
            <h2 className="text-xl font-bold" style={{ color: "var(--color-primary)" }}>
              Authentication Required
            </h2>
            <p className="text-sm max-w-md mx-auto" style={{ color: "var(--color-muted)" }}>
              Please log in or create an account to view and manage your saved trips.
            </p>
            <div className="flex justify-center gap-4 pt-2">
              <Link
                href="/login?redirect=/bookings"
                className="px-6 py-2.5 rounded-full text-white text-sm font-semibold shadow-sm"
                style={{ backgroundColor: "var(--color-primary)" }}
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="px-6 py-2.5 rounded-full border text-sm font-semibold"
                style={{ borderColor: "var(--color-primary)", color: "var(--color-primary)" }}
              >
                Sign Up
              </Link>
            </div>
          </div>
        ) : fetchingTrips ? (
          <div className="bg-white rounded-2xl p-12 text-center border" style={{ borderColor: "var(--color-border)" }}>
            <Loader2 size={24} className="animate-spin text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Loading your saved trips...</p>
          </div>
        ) : trips.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border space-y-4" style={{ borderColor: "var(--color-border)" }}>
            <MapPin size={40} className="mx-auto text-gray-300" />
            <h2 className="text-lg font-bold" style={{ color: "var(--color-primary)" }}>No Saved Trips Yet</h2>
            <p className="text-sm max-w-md mx-auto" style={{ color: "var(--color-muted)" }}>
              You haven't saved any trips yet. Use TravelGenie to generate and save your travel itineraries!
            </p>
            <Link
              href="/plan"
              className="inline-block px-6 py-2.5 rounded-full text-white text-sm font-semibold shadow-sm"
              style={{ backgroundColor: "var(--color-primary)" }}
            >
              Start Planning
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {trips.map((trip) => (
              <div key={trip.id} className="bg-white rounded-xl p-6 border shadow-sm relative space-y-3" style={{ borderColor: "var(--color-border)" }}>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-lg" style={{ color: "var(--color-primary)" }}>
                      {trip.destination}
                    </h3>
                    <p className="text-xs text-gray-500">From: {trip.source || "N/A"}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteTrip(trip.id)}
                    className="text-gray-400 hover:text-red-600 transition-colors p-1"
                    title="Delete Saved Trip"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 pt-2 border-t" style={{ borderColor: "var(--color-border)" }}>
                  <div className="flex items-center gap-1.5">
                    <Calendar size={14} className="text-gray-400" />
                    <span>{trip.start_date || "Flexible dates"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users size={14} className="text-gray-400" />
                    <span>{trip.travelers} Traveler(s)</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">
                    Budget: ₹{trip.budget_inr?.toLocaleString("en-IN")}
                  </span>
                  <Link
                    href={`/plan?destination=${encodeURIComponent(trip.destination)}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-(--color-primary) hover:underline"
                  >
                    <span>View Plan</span>
                    <ArrowUpRight size={14} />
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
