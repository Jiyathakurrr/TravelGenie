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

const attractionSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  destinationId: { type: String, ref: 'DestinationCatalog', required: true },
  stateId: { type: String, ref: 'State', required: true },
  name: { type: String, required: true },
  slug: { type: String, unique: true, required: true },
  description: { type: String, default: '' },
  type: { type: String, enum: ['temple', 'mosque', 'church', 'gurudwara', 'fort', 'palace', 'museum', 'beach', 'waterfall', 'lake', 'park', 'market', 'monument', 'garden', 'cave', 'adventure', 'viewpoint', 'heritage_site', 'wildlife'], required: true },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }
  },
  entryFee: {
    adult: { type: Number, default: 0 },
    child: { type: Number, default: 0 },
    foreign: { type: Number, default: 0 },
    currency: { type: String, default: 'INR' }
  },
  openingHours: { type: String, default: '09:00 AM - 06:00 PM' },
  estimatedDurationMins: { type: Number, default: 120 },
  budgetCategory: { type: String, enum: ['free', 'budget', 'mid', 'luxury'], default: 'budget' },
  images: [imageSchema],
  tags: [{ type: String }],
  nearbyAttractionIds: [{ type: String, ref: 'Attraction' }],
  provenance: { type: provenanceSchema, required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true, collection: 'attractions' });

attractionSchema.index({ location: '2dsphere' });
attractionSchema.index({ destinationId: 1, name: 1 }, { unique: true });

module.exports = mongoose.models.Attraction || mongoose.model('Attraction', attractionSchema, 'attractions');
