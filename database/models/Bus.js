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

const busSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  busNumber: { type: String, unique: true, required: true },
  operator: { type: String, required: true },
  originTerminalId: { type: String, ref: 'BusTerminal', required: true },
  destinationTerminalId: { type: String, ref: 'BusTerminal', required: true },
  departureTime: { type: String, required: true },
  arrivalTime: { type: String, required: true },
  durationMins: { type: Number, required: true },
  fare: {
    seater: { type: Number, default: 500 },
    semi_sleeper: { type: Number, default: 750 },
    sleeper: { type: Number, default: 1100 }
  },
  taxes: { type: Number, default: 45 },
  serviceFees: { type: Number, default: 25 },
  currency: { type: String, default: 'INR' },
  type: { type: String, enum: ['ordinary', 'express', 'luxury', 'sleeper', 'semi_sleeper', 'AC', 'non_AC', 'volvo', 'electric'], default: 'volvo' },
  availability: { type: Number, default: 25 },
  status: { type: String, enum: ['scheduled', 'cancelled', 'delayed'], default: 'scheduled' },
  provenance: { type: provenanceSchema, required: true }
}, { timestamps: true, collection: 'buses' });

busSchema.index({ originTerminalId: 1, destinationTerminalId: 1 });

module.exports = mongoose.models.Bus || mongoose.model('Bus', busSchema, 'buses');
