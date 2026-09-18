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

const flightSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  flightNumber: { type: String, unique: true, required: true },
  airline: { type: String, required: true },
  originAirportId: { type: String, ref: 'Airport', required: true },
  destinationAirportId: { type: String, ref: 'Airport', required: true },
  departureTime: { type: String, required: true },
  arrivalTime: { type: String, required: true },
  durationMins: { type: Number, required: true },
  fare: {
    economy: { type: Number, required: true },
    business: { type: Number, default: 0 },
    first: { type: Number, default: 0 }
  },
  taxes: { type: Number, default: 500 },
  serviceFees: { type: Number, default: 150 },
  currency: { type: String, default: 'INR' },
  stops: { type: Number, default: 0 },
  aircraft: { type: String, default: 'Airbus A320neo' },
  class: [{ type: String, enum: ['economy', 'business', 'first'] }],
  availability: { type: Number, default: 45 },
  status: { type: String, enum: ['scheduled', 'delayed', 'cancelled'], default: 'scheduled' },
  provenance: { type: provenanceSchema, required: true }
}, { timestamps: true, collection: 'flights' });

flightSchema.index({ originAirportId: 1, destinationAirportId: 1 });

module.exports = mongoose.models.Flight || mongoose.model('Flight', flightSchema, 'flights');
