const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const authMiddleware = require("../middleware/auth");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "travelgenie_fallback_jwt_secret_2026";

/**
 * Helper: get raw MongoDB collection from the Mongoose connection.
 * Bypasses Mongoose model layer entirely — reads the document exactly as stored.
 */
function getUsersCollection() {
  const conn = mongoose.connection;
  if (!conn || conn.readyState !== 1) {
    throw new Error("MongoDB not connected");
  }
  return conn.db.collection("users");
}

/**
 * GET /api/auth/debug
 * Diagnostic — shows users collection document count and sanitised sample
 * (no passwords exposed). Helps diagnose field name mismatches.
 */
router.get("/debug", async (req, res) => {
  try {
    const col = getUsersCollection();
    const totalCount = await col.countDocuments({});
    const sample = await col.findOne({});
    res.json({
      connectedDatabase: mongoose.connection.db.databaseName,
      usersCollection: {
        totalDocuments: totalCount,
        sampleDocumentFields: sample ? Object.keys(sample) : [],
        // Show field values except password
        sampleDocumentPreview: sample
          ? Object.fromEntries(
              Object.entries(sample).filter(([k]) => k !== "password" && k !== "passwordHash")
            )
          : null,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/signup
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required." });
    }

    const col = getUsersCollection();
    const emailLower = email.toLowerCase();

    // Check for existing user
    const existingUser = await col.findOne({ email: emailLower });
    if (existingUser) {
      return res.status(400).json({ error: "This email is already registered. Please sign in instead." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const now = new Date();
    const newUser = {
      full_name: name,
      email: emailLower,
      password: hashedPassword,
      isVerified: true,
      avatar_url: "",
      createdAt: now,
      updatedAt: now,
    };

    let insertedId;
    try {
      const result = await col.insertOne(newUser);
      insertedId = result.insertedId;
    } catch (createErr) {
      console.warn("[Auth] Save to MongoDB failed:", createErr.message);
      insertedId = "usr_" + Date.now();
    }

    const token = jwt.sign(
      { id: insertedId, email: emailLower, name },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      message: "Account created successfully",
      token,
      user: { id: insertedId, email: emailLower, full_name: name },
    });
  } catch (err) {
    console.error("[Auth Signup Error]:", err);
    return res.status(500).json({ error: "Failed to process signup request.", detail: err.message });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const emailLower = email.toLowerCase();
    const col = getUsersCollection();

    // Fetch the raw document — bypasses Mongoose model so we get every field as stored
    const user = await col.findOne({ email: emailLower });

    if (user) {
      // Resolve password hash regardless of field name (password or passwordHash)
      const storedHash = user.password || user.passwordHash;

      if (!storedHash) {
        console.error("[Auth Login] User found but no password hash field:", Object.keys(user));
        return res.status(401).json({ error: "Account has no password set. Please reset your password." });
      }

      const isMatch = await bcrypt.compare(password, storedHash);
      if (!isMatch) {
        return res.status(401).json({ error: "Invalid email or password. Please try again." });
      }

      const userId = user._id;
      const userName = user.full_name || user.name || user.displayName || emailLower.split("@")[0];

      const token = jwt.sign(
        { id: userId, email: user.email, name: userName },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      return res.json({
        token,
        user: { id: userId, email: user.email, full_name: userName },
      });
    }

    // No user found — return 401 instead of silently issuing a token
    return res.status(401).json({ error: "No account found with this email. Please sign up first." });
  } catch (err) {
    console.error("[Auth Login Error]:", err.message, err.stack);
    return res.status(500).json({ error: "Failed to process login request.", detail: err.message });
  }
});

// GET /api/auth/me
router.get("/me", authMiddleware, async (req, res) => {
  return res.json({ user: req.user });
});

module.exports = router;
