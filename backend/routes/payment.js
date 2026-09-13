const express = require("express");
const crypto = require("crypto");
const razorpay = require("../config/razorpay");

const router = express.Router();

// POST /api/payment/create-order
router.post("/create-order", async (req, res) => {
  try {
    const { amount, currency = "INR", receipt } = req.body;
    if (!amount) {
      return res.status(400).json({ error: "Amount is required." });
    }

    if (!razorpay) {
      // Return simulated test order if environment keys are missing
      return res.json({
        orderId: "order_simulated_" + Date.now(),
        amount: amount * 100,
        currency,
        key: process.env.RAZORPAY_KEY_ID || "rzp_test_simulated"
      });
    }

    const options = {
      amount: Math.round(amount * 100), // amount in paise
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    return res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error("[Payment Create Order Error]:", err);
    return res.status(500).json({ error: "Failed to create payment order." });
  }
});

// POST /api/payment/verify
router.post("/verify", async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: "Missing required payment verification parameters." });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      // Verification mode fallback
      return res.json({ verified: true, message: "Payment verified in test mode." });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      return res.json({ verified: true, message: "Payment signature verified successfully." });
    } else {
      return res.status(400).json({ verified: false, error: "Invalid payment signature." });
    }
  } catch (err) {
    console.error("[Payment Verification Error]:", err);
    return res.status(500).json({ error: "Payment verification failed." });
  }
});

module.exports = router;
