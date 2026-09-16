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

const travelPackageSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  title: { type: String, required: true },
  slug: { type: String, unique: true, required: true },
  stateIds: [{ type: String, ref: 'State' }],
  destinationIds: [{ type: String, ref: 'Destination' }],
  itineraryTemplateId: { type: String, ref: 'ItineraryTemplate' },
  durationDays: { type: Number, required: true },
  price: {
    min: { type: Number, required: true },
    max: { type: Number, required: true }
  },
  currency: { type: String, default: 'INR' },
  budgetCategory: { type: String, enum: ['budget', 'mid', 'luxury', 'ultra-luxury'], default: 'mid' },
  inclusions: [{ type: String }],
  exclusions: [{ type: String }],
  images: [imageSchema],
  tags: [{ type: String }],
  provenance: { type: provenanceSchema, required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true, collection: 'travel_packages' });

module.exports = mongoose.models.TravelPackage || mongoose.model('TravelPackage', travelPackageSchema, 'travel_packages');
