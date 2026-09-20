/**
 * config/razorpay.js
 * Razorpay Test Mode client configuration helper for TravelGenie
 */
const Razorpay = require("razorpay");

function getRazorpayCredentials() {
  const keyId = (
    process.env.RAZORPAY_KEY_ID ||
    process.env.RAZORPAY_KEY ||
    process.env.RAZORPAY_API_KEY ||
    process.env.VITE_RAZORPAY_KEY_ID ||
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
    ""
  ).trim();

  const keySecret = (
    process.env.RAZORPAY_KEY_SECRET ||
    process.env.RAZORPAY_SECRET ||
    process.env.RAZORPAY_API_SECRET ||
    ""
  ).trim();

  return { keyId, keySecret };
}

let cachedInstance = null;
let lastKeyId = "";
let lastKeySecret = "";

function getRazorpayClient() {
  const { keyId, keySecret } = getRazorpayCredentials();

  if (!keyId || !keySecret) {
    return null;
  }

  if (cachedInstance && keyId === lastKeyId && keySecret === lastKeySecret) {
    return cachedInstance;
  }

  try {
    cachedInstance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
    lastKeyId = keyId;
    lastKeySecret = keySecret;
    return cachedInstance;
  } catch (err) {
    console.error("[Razorpay] Failed to initialize client:", err.message);
    return null;
  }
}

module.exports = {
  getRazorpayCredentials,
  getRazorpayClient,
};
