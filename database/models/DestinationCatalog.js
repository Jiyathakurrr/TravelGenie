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

const destinationCatalogSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  stateId: { type: String, ref: 'State', required: true },
  name: { type: String, required: true },
  slug: { type: String, unique: true, required: true },
  description: { type: String, default: '' },
  type: { type: String, enum: ['city', 'town', 'village', 'hill_station', 'beach', 'heritage', 'wildlife', 'pilgrimage', 'adventure', 'island'], required: true },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }
  },
  estimatedDailyBudget: {
    budget: { type: Number, default: 1500 },
    mid: { type: Number, default: 4000 },
    luxury: { type: Number, default: 12000 }
  },
  budgetCategory: { type: String, enum: ['budget', 'mid', 'luxury', 'ultra-luxury'], default: 'mid' },
  currency: { type: String, default: 'INR' },
  bestTimeToVisit: [{ type: String }],
  tags: [{ type: String }],
  images: [imageSchema],
  nearbyAttractionIds: [{ type: String, ref: 'Attraction' }],
  nearbyTransportIds: [{ type: String }],
  isActive: { type: Boolean, default: true },
  provenance: { type: provenanceSchema, required: true }
}, { timestamps: true, collection: 'destination_catalog' });

destinationCatalogSchema.index({ location: '2dsphere' });
destinationCatalogSchema.index({ stateId: 1, name: 1 }, { unique: true });

module.exports = mongoose.models.DestinationCatalog || mongoose.model('DestinationCatalog', destinationCatalogSchema, 'destination_catalog');
