const express = require("express");
const SavedTrip = require("../models/SavedTrip");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// Memory store fallback if DB is connecting
let inMemoryTrips = [];

// GET /api/trips
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    let trips = [];

    try {
      trips = await SavedTrip.find({ userId }).sort({ createdAt: -1 });
    } catch (dbErr) {
      trips = inMemoryTrips.filter((t) => t.userId === userId);
    }

    return res.json({ trips });
  } catch (err) {
    console.error("[Trips GET Error]:", err);
    return res.status(500).json({ error: "Failed to fetch saved trips." });
  }
});

// POST /api/trips
router.post("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { destination, source, startDate, endDate, travelers, budgetINR, transportType, itineraryDetails } = req.body;

    if (!destination) {
      return res.status(400).json({ error: "Destination is required." });
    }

    const tripData = {
      userId,
      destination,
      source: source || "Mumbai",
      startDate: startDate || new Date().toISOString().split("T")[0],
      endDate: endDate || new Date(Date.now() + 86400000 * 4).toISOString().split("T")[0],
      travelers: travelers || 2,
      budgetINR: budgetINR || 30000,
      transportType: transportType || "Flight",
      itineraryDetails: itineraryDetails || {},
      createdAt: new Date().toISOString(),
    };

    let newTrip = null;
    try {
      newTrip = await SavedTrip.create(tripData);
    } catch (dbErr) {
      tripData.id = "trip_" + Date.now();
      inMemoryTrips.unshift(tripData);
      newTrip = tripData;
    }

    return res.status(201).json({ message: "Trip saved successfully", trip: newTrip });
  } catch (err) {
    console.error("[Trips POST Error]:", err);
    return res.status(500).json({ error: "Failed to save trip." });
  }
});

// DELETE /api/trips
router.delete("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const tripId = req.query.id;

    if (!tripId) {
      return res.status(400).json({ error: "Trip ID is required." });
    }

    try {
      await SavedTrip.deleteOne({ _id: tripId, userId });
    } catch (dbErr) {
      inMemoryTrips = inMemoryTrips.filter((t) => t.id !== tripId || t.userId !== userId);
    }

    return res.json({ message: "Trip deleted successfully." });
  } catch (err) {
    console.error("[Trips DELETE Error]:", err);
    return res.status(500).json({ error: "Failed to delete trip." });
  }
});

module.exports = router;
