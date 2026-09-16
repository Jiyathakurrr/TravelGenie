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

const trainSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  trainNumber: { type: String, unique: true, required: true },
  trainName: { type: String, required: true },
  originStationId: { type: String, ref: 'RailwayStation', required: true },
  destinationStationId: { type: String, ref: 'RailwayStation', required: true },
  departureTime: { type: String, required: true },
  arrivalTime: { type: String, required: true },
  durationMins: { type: Number, required: true },
  fare: {
    sleeper: { type: Number, default: 450 },
    ac3tier: { type: Number, default: 1100 },
    ac2tier: { type: Number, default: 1600 },
    acFirstClass: { type: Number, default: 2800 }
  },
  taxes: { type: Number, default: 80 },
  serviceFees: { type: Number, default: 40 },
  currency: { type: String, default: 'INR' },
  type: { type: String, enum: ['express', 'superfast', 'rajdhani', 'shatabdi', 'jan_shatabdi', 'duronto', 'vande_bharat', 'local', 'special', 'passenger'], default: 'superfast' },
  availability: {
    sleeper: { type: Number, default: 120 },
    ac3tier: { type: Number, default: 45 },
    ac2tier: { type: Number, default: 20 },
    acFirstClass: { type: Number, default: 8 }
  },
  status: { type: String, enum: ['running', 'cancelled', 'diverted'], default: 'running' },
  provenance: { type: provenanceSchema, required: true }
}, { timestamps: true, collection: 'trains' });

trainSchema.index({ originStationId: 1, destinationStationId: 1 });

module.exports = mongoose.models.Train || mongoose.model('Train', trainSchema, 'trains');
