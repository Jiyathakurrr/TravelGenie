"use client";

import { useState } from "react";
import { CreditCard, Loader2, ShieldCheck } from "lucide-react";
import type { Itinerary } from "@/types/chat";

interface Props {
  itinerary: Itinerary;
  isLoggedIn: boolean;
  onRequireLogin: () => void;
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay?: any;
  }
}

function formatINR(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}

export default function RazorpayPayButton({ itinerary, isLoggedIn, onRequireLogin }: Props) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "failed">("idle");

  async function handlePayment() {
    if (!isLoggedIn) {
      onRequireLogin();
      return;
    }

    setLoading(true);
    setStatus("idle");

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: itinerary.estimatedCostINR,
          currency: "INR",
          receipt: `tg_${itinerary.id}`,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const { orderId, amount, currency, key } = data;

      // Load Razorpay script if not already loaded
      if (!window.Razorpay) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.onload = () => resolve();
          script.onerror = () => reject(new Error("Failed to load Razorpay SDK"));
          document.body.appendChild(script);
        });
      }

      const options = {
        key,
        amount,
        currency,
        name: "Travel Genie",
        description: itinerary.tripTitle,
        order_id: orderId,
        handler: function () {
          setStatus("success");
          setLoading(false);
        },
        modal: {
          ondismiss: function () {
            setStatus("failed");
            setLoading(false);
          },
        },
        prefill: {
          name: "Test User",
          email: "test@travelgenie.dev",
        },
        notes: {
          simulation: "RAZORPAY TEST MODE — No real transaction",
          itineraryId: itinerary.id,
        },
        theme: { color: "#033D4A" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("[payment] Error:", err);
      setStatus("failed");
      setLoading(false);
    }
  }

  if (status === "success") {
    return (
      <div
        className="flex items-center gap-3 px-6 py-4 rounded-[var(--radius-md)]"
        style={{ backgroundColor: "#EAFAF1", border: "1px solid #6FCF97" }}
      >
        <ShieldCheck size={20} style={{ color: "#27AE60" }} />
        <div>
          <p className="text-sm font-semibold" style={{ color: "#1A6B35" }}>Booking Confirmed (Simulated)</p>
          <p className="text-xs mt-0.5" style={{ color: "#27AE60" }}>
            Razorpay Test Mode — No real payment was processed.
          </p>
        </div>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div
        className="flex flex-col gap-3 px-6 py-4 rounded-[var(--radius-md)]"
        style={{ backgroundColor: "#FEF2F2", border: "1px solid #FCA5A5" }}
      >
        <p className="text-sm font-semibold" style={{ color: "#991B1B" }}>Payment cancelled or failed.</p>
        <button
          onClick={() => setStatus("idle")}
          className="text-sm font-medium underline"
          style={{ color: "#991B1B" }}
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className="w-full flex items-center justify-center gap-3 py-4 rounded-[var(--radius-md)] text-sm font-semibold transition-all active:scale-95 disabled:opacity-60"
      style={{ backgroundColor: "var(--color-accent)", color: "var(--color-white)" }}
    >
      {loading ? (
        <Loader2 size={18} className="animate-spin" />
      ) : (
        <CreditCard size={18} />
      )}
      {loading ? "Opening Razorpay..." : `Confirm & Book — ${formatINR(itinerary.estimatedCostINR)}`}
    </button>
  );
}
