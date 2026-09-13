const mongoose = require("mongoose");

const DestinationSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    state: { type: String },
    region: { type: String },
    popular_for: { type: String },
    description: { type: String },
    heroImage: { type: String },
    rating: { type: Number, default: 4.7 },
    reviewCount: { type: Number, default: 1200 },
    startingPriceINR: { type: Number, default: 9500 },
    bestTimeToVisit: { type: String, default: "Oct - Mar" },
    experiences: [{ type: String }],
    general_safety_score: { type: Number, default: 4.5 },
    girls_trip_safety_score: { type: Number, default: 4.4 },
    safety_note: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.models.Destination || mongoose.model("Destination", DestinationSchema);
