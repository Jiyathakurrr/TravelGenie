/**
 * routes/destinations.js
 * Serves destination data from the `destination_catalog` MongoDB collection.
 *
 * Uses mongoose.connection.db (raw native driver) instead of importing
 * cross-directory model files (database/models/) that don't have access
 * to backend/node_modules/mongoose.
 *
 * Mirrors the query logic in frontend/server.ts lines 62-153.
 */
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

/**
 * Helper — returns the native MongoDB db handle from the existing Mongoose connection.
 * Throws if Mongoose has not yet connected (readyState !== 1).
 */
function getDb() {
  const conn = mongoose.connection;
  if (!conn || conn.readyState !== 1) {
    throw new Error("MongoDB not connected yet");
  }
  return conn.db;
}

/**
 * GET /api/destinations
 * Query params:
 *   type   — filter by destination type (city, beach, heritage, etc.)
 *   search — partial name match (case-insensitive)
 *   limit  — max results (default 60, max 200)
 */
router.get("/", async (req, res) => {
  try {
    const db = getDb();
    const { type, search, limit = "60" } = req.query;

    const query = { isActive: { $ne: false } };
    if (type && type !== "all") {
      query.type = type;
    }
    if (search && typeof search === "string") {
      query.name = { $regex: new RegExp(search, "i") };
    }

    const limitNum = Math.min(parseInt(limit) || 60, 200);

    const destinations = await db
      .collection("destination_catalog")
      .find(query)
      .limit(limitNum)
      .toArray();

    // Enrich with state names
    const states = await db.collection("states").find({}).toArray();
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
    const db = getDb();
    const idOrSlug = req.params.id;

    const destination = await db.collection("destination_catalog").findOne({
      $or: [
        { _id: idOrSlug },
        { slug: idOrSlug },
        { name: { $regex: new RegExp(`^${idOrSlug}$`, "i") } },
      ],
    });

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
      db.collection("states").findOne({ _id: destination.stateId }),
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
