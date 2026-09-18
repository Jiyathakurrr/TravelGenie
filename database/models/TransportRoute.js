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

const transportRouteSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  routeCode: { type: String, unique: true, required: true },
  type: { type: String, enum: ['flight', 'train', 'bus', 'multi'], required: true },
  origin: {
    name: { type: String, required: true },
    stateId: { type: String, ref: 'State', required: true },
    coordinates: { type: [Number] }
  },
  destination: {
    name: { type: String, required: true },
    stateId: { type: String, ref: 'State', required: true },
    coordinates: { type: [Number] }
  },
  distanceKm: { type: Number, required: true },
  estimatedDurationMins: { type: Number, required: true },
  estimatedTransportCost: {
    min: { type: Number, required: true },
    max: { type: Number, required: true }
  },
  currency: { type: String, default: 'INR' },
  frequency: { type: String, enum: ['daily', 'weekly', 'occasional', 'seasonal'], default: 'daily' },
  providers: [{ type: String }],
  provenance: { type: provenanceSchema, required: true }
}, { timestamps: true, collection: 'transport_routes' });

transportRouteSchema.index({ 'origin.stateId': 1, 'destination.stateId': 1 });

module.exports = mongoose.models.TransportRoute || mongoose.model('TransportRoute', transportRouteSchema, 'transport_routes');
