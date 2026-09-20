/**
 * server.js — TravelGenie Express Backend Server for Render
 */
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const mongoose = require("mongoose");
const connectDB = require("./config/db");

const authRoutes = require("./routes/auth");
const chatRoutes = require("./routes/chat");
const tripsRoutes = require("./routes/trips");
const uploadRoutes = require("./routes/upload");
const paymentRoutes = require("./routes/payment");
const destinationsRoutes = require("./routes/destinations");

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// CORS configuration for Vercel frontend
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:3000",
  "http://localhost:5173",
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl) or matching origins
      if (!origin || allowedOrigins.some((o) => origin.startsWith(o))) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive CORS for deployed Vercel apps
    },
    credentials: true,
  })
);

app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health Check
app.get("/", (req, res) => {
  res.json({
    app: "TravelGenie Render Express Backend",
    status: "healthy",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/trips", tripsRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/destinations", destinationsRoutes);

// Transport options endpoint (flights, trains, buses)
app.get("/api/transport", async (req, res) => {
  try {
    const conn = mongoose.connection;
    if (conn && conn.readyState === 1) {
      const [flights, trains, buses] = await Promise.all([
        conn.db.collection("flights").find().limit(15).toArray().catch(() => []),
        conn.db.collection("trains").find().limit(15).toArray().catch(() => []),
        conn.db.collection("buses").find().limit(15).toArray().catch(() => []),
      ]);
      return res.json({ flights, trains, buses });
    }
    return res.json({ flights: [], trains: [], buses: [] });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch transport data" });
  }
});

// Confirmed Bookings endpoint
app.get("/api/bookings", async (req, res) => {
  try {
    const conn = mongoose.connection;
    if (!conn || conn.readyState !== 1) {
      return res.json({ bookings: [] });
    }
    const authHeader = req.headers.authorization;
    let email = null;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      if (token.startsWith("jwt_token_")) {
        try {
          email = Buffer.from(token.replace("jwt_token_", ""), "base64").toString("utf8");
        } catch (_) {}
      }
    }
    email = email || req.headers["x-user-email"] || req.query.email;
    if (!email) {
      return res.json({ bookings: [] });
    }
    const bookings = await conn.db
      .collection("bookings")
      .find({ userEmail: email.toLowerCase().trim() })
      .sort({ createdAt: -1 })
      .toArray();
    res.json({ bookings });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch bookings", bookings: [] });
  }
});

// Travel Packages endpoint
app.get("/api/packages", async (req, res) => {
  try {
    const conn = mongoose.connection;
    if (conn && conn.readyState === 1) {
      const packages = await conn.db
        .collection("travel_packages")
        .find({ isActive: { $ne: false } })
        .limit(20)
        .toArray()
        .catch(() => []);
      return res.json(packages);
    }
    return res.json([]);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch packages" });
  }
});

// Itinerary Templates endpoint
app.get("/api/itineraries", async (req, res) => {
  try {
    const conn = mongoose.connection;
    if (conn && conn.readyState === 1) {
      const itineraries = await conn.db
        .collection("itinerary_templates")
        .find()
        .limit(20)
        .toArray()
        .catch(() => []);
      return res.json(itineraries);
    }
    return res.json([]);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch itineraries" });
  }
});

// Accommodations endpoint
app.get("/api/accommodations", async (req, res) => {
  try {
    const conn = mongoose.connection;
    if (conn && conn.readyState === 1) {
      const { destinationId, limit = "20" } = req.query;
      const query = { isActive: { $ne: false } };
      if (destinationId) query.destinationId = destinationId;
      const results = await conn.db
        .collection("accommodations")
        .find(query)
        .limit(parseInt(limit) || 20)
        .toArray()
        .catch(() => []);
      return res.json(results);
    }
    return res.json([]);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch accommodations" });
  }
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("[Express Error Handler]:", err.stack || err);
  res.status(500).json({ error: err.message || "Internal Server Error" });
});

app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`🚀 TravelGenie Backend listening on port ${PORT}`);
  console.log(`🌐 Allowed Origins: ${allowedOrigins.join(", ")}`);
  console.log(`==================================================`);
});
