'use strict';
const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  url: { type: String, default: '' },
  publicId: { type: String, default: '' },
  altText: { type: String, default: '' },
  type: { type: String, enum: ['hero', 'gallery', 'thumbnail', 'map'], default: 'hero' }
}, { _id: false });

const provenanceSchema = new mongoose.Schema({
  sourceType: { type: String, enum: ['SIMULATED', 'OFFICIAL', 'API', 'MANUAL'], required: true },
  sourceName: { type: String, default: 'TravelGenie Synthetic Generator' },
  dataVersion: { type: String, default: '1.0.0' },
  lastVerifiedAt: { type: Date, default: Date.now }
}, { _id: false });

const monthRatingSchema = new mongoose.Schema({
  month: { type: Number, min: 1, max: 12, required: true },
  rating: { type: Number, min: 1, max: 5, default: 3 },
  weather: { type: String, default: 'Pleasant' },
  crowdLevel: { type: String, enum: ['low', 'moderate', 'high', 'very_high'], default: 'moderate' },
  priceMultiplier: { type: Number, default: 1.0 }
}, { _id: false });

const destinationSeasonSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  destinationId: { type: String, ref: 'DestinationCatalog', required: true, unique: true },
  stateId: { type: String, ref: 'State', required: true },
  peakSeason: [monthRatingSchema],
  offSeason: [{ type: Number, min: 1, max: 12 }],
  monsoonMonths: [{ type: Number, min: 1, max: 12 }],
  snowMonths: [{ type: Number, min: 1, max: 12 }],
  bestFor: [{ type: String }],
  provenance: { type: provenanceSchema, required: true }
}, { timestamps: true, collection: 'destination_seasons' });

module.exports = mongoose.models.DestinationSeason || mongoose.model('DestinationSeason', destinationSeasonSchema, 'destination_seasons');
