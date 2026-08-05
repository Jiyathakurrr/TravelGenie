import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { XCircle } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Booking Cancelled — Travel Genie" };

export default function CheckoutCancelPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--color-cream)" }}>
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-6 pt-24 pb-12">
        <div
          className="max-w-md w-full p-12 rounded-[var(--radius-xl)] text-center"
          style={{ backgroundColor: "var(--color-white)", border: "1px solid var(--color-border)", boxShadow: "var(--shadow-lg)" }}
        >
          <XCircle size={56} className="mx-auto mb-6" style={{ color: "#BA2525" }} />
          <h1 className="text-3xl mb-3" style={{ fontFamily: "var(--font-display)" }}>
            Payment Cancelled
          </h1>
          <p className="text-sm mb-8" style={{ color: "var(--color-secondary)" }}>
            Your booking was not completed. No payment was processed. You can try again anytime.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href="/plan"
              className="w-full py-3 rounded-[var(--radius-md)] text-sm font-semibold text-center transition-all active:scale-95"
              style={{ backgroundColor: "var(--color-accent)", color: "white" }}
            >
              Back to Planning
            </Link>
            <Link href="/" className="text-sm font-medium" style={{ color: "var(--color-secondary)" }}>
              Go to Home
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
