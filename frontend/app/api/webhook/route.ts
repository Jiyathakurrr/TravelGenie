import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

/**
 * // SIMULATED CHECKOUT — Razorpay Webhook Handler
 */
export async function POST(req: NextRequest) {
  try {
    const secret = process.env.RAZORPAY_KEY_SECRET || "placeholder_secret";
    const bodyText = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing signature header" }, { status: 400 });
    }

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(bodyText)
      .digest("hex");

    const isValid = signature === expectedSignature;

    return NextResponse.json({ verified: isValid, simulated: true });
  } catch (err) {
    console.error("[api/webhook] Error verifying webhook:", err);
    return NextResponse.json({ error: "Webhook processing error" }, { status: 500 });
  }
}
