const mongoose = require("mongoose");

const SavedTripSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    destination: { type: String, required: true },
    source: { type: String, default: "Mumbai" },
    startDate: { type: String },
    endDate: { type: String },
    travelers: { type: Number, default: 2 },
    budgetINR: { type: Number, default: 30000 },
    transportType: { type: String, default: "Flight" },
    itineraryDetails: { type: Object, default: {} },
  },
  { timestamps: true }
);

module.exports = mongoose.models.SavedTrip || mongoose.model("SavedTrip", SavedTripSchema);
