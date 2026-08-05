import { NextRequest, NextResponse } from "next/server";
import { razorpay } from "@/lib/razorpay";
import type { CheckoutResponse } from "@/types/chat";

/**
 * // SIMULATED CHECKOUT — Razorpay Test Mode only
 * No real payment processing or credential scraping ever.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount = 15000, currency = "INR", receipt } = body;

    const options = {
      amount: Math.round(amount * 100), // amount in paise
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
      notes: {
        simulation: "Razorpay Test Mode Order for TravelGenie Capstone",
      },
    };

    let orderId = `order_sim_${Date.now()}`;
    try {
      if (process.env.RAZORPAY_KEY_ID) {
        const order = await razorpay.orders.create(options);
        orderId = order.id;
      }
    } catch (e) {
      console.warn("[checkout] Razorpay API call failed or missing keys. Falling back to simulated order ID.");
    }

    const response: CheckoutResponse = {
      orderId,
      amount: options.amount,
      currency: options.currency,
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_placeholder_key",
    };

    return NextResponse.json(response);
  } catch (err) {
    console.error("[api/checkout] Error:", err);
    return NextResponse.json({ error: "Failed to create simulated checkout order" }, { status: 500 });
  }
}
