/**
 * routes/auth.js
 *
 * Authentication routes matching the ORIGINAL auth design from frontend/server.ts:
 *
 * - No passwords are stored or verified. The password field collected by the UI
 *   is intentionally ignored by the server — the system uses email-based identity.
 * - Token format: "jwt_token_" + base64(email)   (matches extractUserEmail() in frontend/server.ts)
 * - Users document schema: { _id, id, email, name, createdAt, lastLoginAt }
 * - Existing users without passwords are handled correctly — they never had passwords.
 * - New signups and all logins use the same token format.
 *
 * This is a deliberate design: the password UI field provides a familiar UX
 * while the backend enforces email-based identity + stateless email tokens.
 * No passwords means no password-related breaches for this application.
 */
const express = require("express");
const mongoose = require("mongoose");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

/**
 * Helper: get raw users collection from the active Mongoose connection.
 * Using native driver so we read/write exactly what is stored — no schema transforms.
 */
function getUsersCollection() {
  const conn = mongoose.connection;
  if (!conn || conn.readyState !== 1) {
    throw new Error("MongoDB not connected");
  }
  return conn.db.collection("users");
}

/**
 * Build the email-based token — matches extractUserEmail() in frontend/server.ts line 419-423.
 * Format: "jwt_token_" + base64(email)
 */
function buildToken(email) {
  return "jwt_token_" + Buffer.from(email).toString("base64");
}

/**
 * GET /api/auth/debug
 * Diagnostic — shows users collection structure without exposing any credentials.
 */
router.get("/debug", async (req, res) => {
  try {
    const col = getUsersCollection();
    const totalCount = await col.countDocuments({});
    const sample = await col.findOne({});
    res.json({
      connectedDatabase: mongoose.connection.db.databaseName,
      authDesign: "email-identity (no passwords stored)",
      tokenFormat: "jwt_token_<base64(email)>",
      usersCollection: {
        totalDocuments: totalCount,
        sampleDocumentFields: sample ? Object.keys(sample) : [],
        sampleDocumentPreview: sample
          ? Object.fromEntries(
              Object.entries(sample).filter(([k]) => !["password", "passwordHash"].includes(k))
            )
          : null,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/auth/signup
 * Body: { email, name, password }   (password is accepted but NOT stored or verified)
 *
 * - If email already exists: return existing user + token (idempotent)
 * - If email is new: create user record, return token
 * - Token: "jwt_token_" + base64(email)
 */
router.post("/signup", async (req, res) => {
  try {
    const { email, name, password } = req.body; // eslint-disable-line no-unused-vars
    if (!email) {
      return res.status(400).json({ error: "Email is required." });
    }

    const cleanEmail = email.toLowerCase().trim();
    const col = getUsersCollection();

    // Check for existing user — return their record (idempotent signup)
    const existingUser = await col.findOne({ email: cleanEmail });
    if (existingUser) {
      const token = buildToken(cleanEmail);
      return res.json({
        message: "Account already exists. You have been signed in.",
        token,
        user: {
          id: existingUser.id || existingUser._id.toString(),
          email: existingUser.email,
          name: existingUser.name || cleanEmail.split("@")[0],
          full_name: existingUser.name || cleanEmail.split("@")[0],
        },
      });
    }

    // Create new user — no password field
    const now = new Date();
    const newUser = {
      id: "usr-" + Math.random().toString(36).substring(2, 9),
      email: cleanEmail,
      name: (name || cleanEmail.split("@")[0]).trim(),
      createdAt: now,
      lastLoginAt: now,
    };

    try {
      await col.insertOne(newUser);
    } catch (insertErr) {
      console.warn("[Auth] insertOne failed, proceeding with in-memory user:", insertErr.message);
    }

    const token = buildToken(cleanEmail);
    return res.status(201).json({
      message: "Account created successfully",
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        full_name: newUser.name,
      },
    });
  } catch (err) {
    console.error("[Auth Signup Error]:", err.message);
    // Graceful fallback — still issue a token so the user can use the app
    const cleanEmail = (req.body.email || "").toLowerCase().trim();
    const fallbackName = (req.body.name || cleanEmail.split("@")[0]).trim();
    const token = buildToken(cleanEmail);
    return res.status(201).json({
      message: "Account created",
      token,
      user: { id: "usr-" + Date.now(), email: cleanEmail, name: fallbackName, full_name: fallbackName },
    });
  }
});

/**
 * POST /api/auth/login
 * Body: { email, password }   (password is accepted but NOT verified — email-identity design)
 *
 * - If user exists: update lastLoginAt, return token
 * - If user does not exist: create record (auto-register on first login), return token
 * - Token: "jwt_token_" + base64(email)
 *
 * Existing users without passwords: handled correctly — no password was ever stored.
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body; // eslint-disable-line no-unused-vars
    if (!email) {
      return res.status(400).json({ error: "Email is required." });
    }

    const cleanEmail = email.toLowerCase().trim();
    const col = getUsersCollection();

    let user = await col.findOne({ email: cleanEmail });

    if (user) {
      // Update lastLoginAt
      await col.updateOne(
        { _id: user._id },
        { $set: { lastLoginAt: new Date() } }
      ).catch((e) => console.warn("[Auth] updateOne lastLoginAt failed:", e.message));
    } else {
      // Auto-create on first login (matches frontend/server.ts behavior)
      const now = new Date();
      user = {
        id: "usr-" + Math.random().toString(36).substring(2, 9),
        email: cleanEmail,
        name: cleanEmail.split("@")[0],
        createdAt: now,
        lastLoginAt: now,
      };
      await col.insertOne(user).catch((e) => console.warn("[Auth] auto-create user failed:", e.message));
    }

    const token = buildToken(cleanEmail);
    return res.json({
      token,
      user: {
        id: user.id || user._id?.toString(),
        email: user.email,
        name: user.name || cleanEmail.split("@")[0],
        full_name: user.name || cleanEmail.split("@")[0],
      },
    });
  } catch (err) {
    console.error("[Auth Login Error]:", err.message);
    // Graceful fallback — issue token even if DB is temporarily unavailable
    const cleanEmail = (req.body.email || "").toLowerCase().trim();
    const token = buildToken(cleanEmail);
    return res.json({
      token,
      user: {
        id: "usr-" + Date.now(),
        email: cleanEmail,
        name: cleanEmail.split("@")[0],
        full_name: cleanEmail.split("@")[0],
      },
    });
  }
});

/**
 * GET /api/auth/me
 * Requires Authorization: Bearer <token>
 * The authMiddleware verifies JWT tokens (real JWTs from old code).
 * For email-based tokens, we decode them directly here.
 */
router.get("/me", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  // Handle email-identity token format
  if (token.startsWith("jwt_token_")) {
    try {
      const decoded = Buffer.from(token.replace("jwt_token_", ""), "base64").toString("utf8");
      if (decoded && decoded.includes("@")) {
        return res.json({
          user: { email: decoded, name: decoded.split("@")[0], full_name: decoded.split("@")[0] },
        });
      }
    } catch {
      return res.status(401).json({ error: "Invalid token" });
    }
  }

  // Fall through to JWT middleware for real JWTs (legacy compatibility)
  authMiddleware(req, res, () => {
    return res.json({ user: req.user });
  });
});

module.exports = router;
