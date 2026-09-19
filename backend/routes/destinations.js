/**
 * routes/destinations.js
 * Serves destination data from the `destination_catalog` MongoDB collection.
 * Mirrors the logic in frontend/server.ts for /api/destinations.
 */
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

// Lazy-load models from the shared database/models directory
// (backend already has mongoose connected via config/db.js)
const path = require("path");
const DestinationCatalog = require(path.resolve(__dirname, "../../database/models/DestinationCatalog.js"));
const State = require(path.resolve(__dirname, "../../database/models/State.js"));

/**
 * GET /api/destinations
 * Query params:
 *   type   — filter by destination type (city, beach, heritage, etc.)
 *   search — partial name match (case-insensitive)
 *   limit  — max results (default 60, max 200)
 */
router.get("/", async (req, res) => {
  try {
    const { type, search, limit = "60" } = req.query;

    const query = { isActive: { $ne: false } };
    if (type && type !== "all") {
      query.type = type;
    }
    if (search && typeof search === "string") {
      query.name = { $regex: new RegExp(search, "i") };
    }

    const limitNum = Math.min(parseInt(limit) || 60, 200);

    const destinations = await DestinationCatalog.find(query).limit(limitNum).lean();

    // Enrich with state names
    const states = await State.find().lean();
    const stateMap = new Map(states.map((s) => [s._id, s.name]));

    const enriched = destinations.map((d) => ({
      ...d,
      stateName: stateMap.get(d.stateId) || d.stateId,
    }));

    res.json(enriched);
  } catch (err) {
    console.error("Error fetching destinations:", err);
    res.status(500).json({ error: "Failed to fetch destinations from MongoDB" });
  }
});

/**
 * GET /api/destinations/:id
 * Lookup by _id, slug, or name (case-insensitive).
 * Returns destination details with related state, accommodations, attractions, etc.
 */
router.get("/:id", async (req, res) => {
  try {
    const idOrSlug = req.params.id;
    const conn = mongoose.connection;
    const db = conn.db;

    // Find by _id, slug, or name
    const destination = await DestinationCatalog.findOne({
      $or: [
        { _id: idOrSlug },
        { slug: idOrSlug },
        { name: { $regex: new RegExp(`^${idOrSlug}$`, "i") } },
      ],
    }).lean();

    if (!destination) {
      return res.status(404).json({ error: "Destination not found" });
    }

    const destId = destination._id;

    // Parallel fetch related collections (graceful — missing collections return empty)
    const [
      state,
      accommodations,
      attractions,
      pilgrimageSites,
      safety,
      seasons,
      airports,
      railwayStations,
    ] = await Promise.all([
      State.findOne({ _id: destination.stateId }).lean(),
      db.collection("accommodations").find({ destinationId: destId }).limit(10).toArray().catch(() => []),
      db.collection("attractions").find({ destinationId: destId }).limit(10).toArray().catch(() => []),
      db.collection("pilgrimage_sites").find({ destinationId: destId }).limit(6).toArray().catch(() => []),
      db.collection("destination_safety").findOne({ destinationId: destId }).catch(() => null),
      db.collection("destination_seasons").findOne({ destinationId: destId }).catch(() => null),
      db.collection("airports").find({ destinationId: destId }).limit(4).toArray().catch(() => []),
      db.collection("railway_stations").find({ destinationId: destId }).limit(4).toArray().catch(() => []),
    ]);

    res.json({
      ...destination,
      stateName: state?.name || destination.stateId,
      stateInfo: state,
      accommodations,
      attractions,
      pilgrimageSites,
      safety,
      seasons,
      airports,
      railwayStations,
    });
  } catch (err) {
    console.error("Error fetching destination details:", err);
    res.status(500).json({ error: "Failed to fetch destination details" });
  }
});

module.exports = router;
