/**
 * routes/payment.js
 * Razorpay Test Mode Payment Handler for TravelGenie
 */
const express = require("express");
const crypto = require("crypto");
const mongoose = require("mongoose");
const { getRazorpayClient, getRazorpayCredentials } = require("../config/razorpay");

const router = express.Router();

function getDb() {
  const conn = mongoose.connection;
  if (conn && conn.readyState === 1) {
    return conn.db;
  }
  return null;
}

function extractUserEmail(req) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    if (token.startsWith("jwt_token_")) {
      try {
        const decoded = Buffer.from(token.replace("jwt_token_", ""), "base64").toString("utf8");
        if (decoded && decoded.includes("@")) return decoded.toLowerCase().trim();
      } catch (_) {}
    }
  }
  const emailHeader = req.headers["x-user-email"] || req.query.email || req.body?.userEmail;
  if (emailHeader && typeof emailHeader === "string" && emailHeader.includes("@")) {
    return emailHeader.toLowerCase().trim();
  }
  return null;
}

// GET /api/payment/config
router.get("/config", (req, res) => {
  const { keyId, keySecret } = getRazorpayCredentials();
  const isConfigured = Boolean(keyId && keySecret);

  res.json({
    keyId: keyId || null,
    currency: "INR",
    mode: "test",
    isConfigured,
    configNotice: !keyId
      ? "RAZORPAY_KEY_ID is missing in backend environment variables."
      : !keySecret
      ? "RAZORPAY_KEY_SECRET is missing in backend environment variables."
      : null,
  });
});

// POST /api/payment/create-order
router.post("/create-order", async (req, res) => {
  try {
    const { amount, currency = "INR", destination, travelers, duration, bookingDetails } = req.body;
    const amountNumber = Math.max(1, Number(amount) || 1499);
    const amountInPaise = Math.round(amountNumber * 100);

    const { keyId, keySecret } = getRazorpayCredentials();

    if (!keyId) {
      return res.status(400).json({
        error: "RAZORPAY_KEY_ID is not configured in backend environment variables.",
        code: "MISSING_KEY_ID",
      });
    }

    if (!keySecret) {
      return res.status(400).json({
        error: "RAZORPAY_KEY_SECRET is not configured in backend environment variables.",
        code: "MISSING_KEY_SECRET",
      });
    }

    const razorpay = getRazorpayClient();
    if (!razorpay) {
      return res.status(500).json({
        error: "Failed to initialize Razorpay test client with provided credentials.",
        code: "RAZORPAY_INIT_FAILED",
      });
    }

    const email = extractUserEmail(req) || bookingDetails?.userEmail || "guest@travelgenie.in";
    const receiptId = `rcpt_${Date.now().toString(36)}`;

    const options = {
      amount: amountInPaise,
      currency,
      receipt: receiptId,
      notes: {
        destination: destination || bookingDetails?.destination || "Custom Itinerary",
        travelers: String(travelers || bookingDetails?.travelers || 2),
        duration: duration || bookingDetails?.duration || "4 Days / 3 Nights",
        userEmail: email,
      },
    };

    const order = await razorpay.orders.create(options);

    return res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency || "INR",
      keyId,
      key: keyId,
    });
  } catch (err) {
    console.error("[Payment Create Order Error]:", err);
    const errorDesc = err?.error?.description || err?.message || "Failed to create Razorpay payment order.";
    return res.status(500).json({
      error: `Razorpay Error: ${errorDesc}`,
      code: err?.error?.code || "CREATE_ORDER_FAILED",
    });
  }
});

// POST /api/payment/verify
router.post("/verify", async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingDetails } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        verified: false,
        error: "Missing required payment verification parameters (razorpay_order_id, razorpay_payment_id, razorpay_signature).",
      });
    }

    const { keySecret } = getRazorpayCredentials();

    if (keySecret) {
      const expectedSignature = crypto
        .createHmac("sha256", keySecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");

      if (expectedSignature !== razorpay_signature) {
        console.warn("[Payment Verify] Signature mismatch.");
        return res.status(400).json({
          success: false,
          verified: false,
          error: "Payment verification failed: Invalid Razorpay cryptographic signature.",
        });
      }
    }

    const email = extractUserEmail(req) || bookingDetails?.userEmail || "guest@travelgenie.in";
    const now = new Date();

    const bookingDoc = {
      bookingId: "BK-" + Math.floor(100000 + Math.random() * 900000),
      userEmail: email.toLowerCase().trim(),
      userName: bookingDetails?.userName || email.split("@")[0] || "Traveler",
      destination: bookingDetails?.destination || "Custom Itinerary",
      travelers: Number(bookingDetails?.travelers) || 2,
      duration: bookingDetails?.duration || "4 Days / 3 Nights",
      amount: Number(bookingDetails?.amount) || 1499,
      currency: "INR",
      status: "confirmed",
      payment: {
        gateway: "razorpay",
        mode: "test",
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        signature: razorpay_signature,
        paidAt: now,
      },
      itinerarySummary: bookingDetails?.itinerarySummary || "",
      createdAt: now,
    };

    const db = getDb();
    if (db) {
      try {
        await db.collection("bookings").insertOne(bookingDoc);
      } catch (dbErr) {
        console.warn("[Payment Verify] Booking record save warning:", dbErr.message);
      }
    }

    return res.json({
      success: true,
      verified: true,
      booking: bookingDoc,
      message: "Payment verified successfully. Booking confirmed!",
    });
  } catch (err) {
    console.error("[Payment Verify Error]:", err);
    return res.status(500).json({
      success: false,
      verified: false,
      error: "Internal payment verification error: " + (err.message || ""),
    });
  }
});

// POST /api/payment/failed
router.post("/failed", async (req, res) => {
  try {
    const { orderId, error, bookingDetails } = req.body;
    const email = extractUserEmail(req) || bookingDetails?.userEmail || "guest@travelgenie.in";
    const db = getDb();
    if (db) {
      await db.collection("failed_payments").insertOne({
        orderId: orderId || null,
        userEmail: email.toLowerCase().trim(),
        error: error || "Payment declined or dismissed",
        bookingDetails: bookingDetails || {},
        createdAt: new Date(),
      });
    }
    return res.json({ success: true });
  } catch (err) {
    console.error("[Payment Failed Log Error]:", err);
    return res.status(500).json({ error: "Failed to log payment failure" });
  }
});

module.exports = router;
