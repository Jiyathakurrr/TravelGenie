/**
 * lib/razorpay.ts
 * Razorpay Test Mode client initialization.
 * // SIMULATED CHECKOUT — Razorpay Test Mode only, no real transactions.
 */

import Razorpay from "razorpay";

const keyId = process.env.RAZORPAY_KEY_ID ?? "rzp_test_placeholder_key";
const keySecret = process.env.RAZORPAY_KEY_SECRET ?? "placeholder_secret";

if (!process.env.RAZORPAY_KEY_ID) {
  console.warn("[razorpay] RAZORPAY_KEY_ID is missing. Using test fallback key.");
}

export const razorpay = new Razorpay({
  key_id: keyId,
  key_secret: keySecret,
});
