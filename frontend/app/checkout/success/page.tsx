import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { CheckCircle, ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Booking Confirmed — Travel Genie" };

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--color-cream)" }}>
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-6 pt-24 pb-12">
        <div
          className="max-w-md w-full p-12 rounded-[var(--radius-xl)] text-center"
          style={{ backgroundColor: "var(--color-white)", border: "1px solid var(--color-border)", boxShadow: "var(--shadow-lg)" }}
        >
          <CheckCircle size={56} className="mx-auto mb-6" style={{ color: "#27AE60" }} />
          <h1 className="text-3xl mb-3" style={{ fontFamily: "var(--font-display)" }}>
            Booking Confirmed!
          </h1>
          <p className="text-sm mb-3" style={{ color: "var(--color-secondary)" }}>
            Your trip has been booked (simulated via Razorpay Test Mode). A confirmation would be sent to your email in a real scenario.
          </p>
          <p
            className="text-xs px-4 py-2 rounded-full mx-auto inline-block mb-8"
            style={{ backgroundColor: "#EAFAF1", color: "#1A6B35", border: "1px solid #6FCF97" }}
          >
            🔒 No real payment was processed — Razorpay Test Mode only
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href="/bookings"
              className="w-full py-3 rounded-[var(--radius-md)] text-sm font-semibold text-center transition-all active:scale-95"
              style={{ backgroundColor: "var(--color-accent)", color: "white" }}
            >
              View My Bookings <ArrowRight size={14} className="inline ml-1" />
            </Link>
            <Link href="/" className="text-sm font-medium" style={{ color: "var(--color-secondary)" }}>
              Back to Home
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
