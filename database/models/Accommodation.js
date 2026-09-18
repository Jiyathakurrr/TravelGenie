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

const accommodationSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  stateId: { type: String, ref: 'State', required: true },
  destinationId: { type: String, ref: 'DestinationCatalog', required: true },
  name: { type: String, required: true },
  slug: { type: String, unique: true, required: true },
  type: { type: String, enum: ['hotel', 'hostel', 'resort', 'homestay', 'lodge', 'guesthouse', 'villa', 'camping', 'boutique'], required: true },
  starRating: { type: Number, min: 1, max: 5, default: 3 },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }
  },
  address: { type: String, default: '' },
  pricePerNight: {
    min: { type: Number, required: true },
    max: { type: Number, required: true }
  },
  currency: { type: String, default: 'INR' },
  budgetCategory: { type: String, enum: ['budget', 'mid', 'luxury', 'ultra-luxury'], required: true },
  amenities: [{ type: String }],
  images: [imageSchema],
  tags: [{ type: String }],
  nearbyAttractionIds: [{ type: String, ref: 'Attraction' }],
  checkInTime: { type: String, default: '14:00' },
  checkOutTime: { type: String, default: '11:00' },
  provenance: { type: provenanceSchema, required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true, collection: 'accommodations' });

accommodationSchema.index({ location: '2dsphere' });
accommodationSchema.index({ destinationId: 1, name: 1 }, { unique: true });
accommodationSchema.index({ stateId: 1, budgetCategory: 1 });

module.exports = mongoose.models.Accommodation || mongoose.model('Accommodation', accommodationSchema, 'accommodations');
