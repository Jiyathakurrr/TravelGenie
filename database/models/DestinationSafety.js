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

const destinationSafetySchema = new mongoose.Schema({
  _id: { type: String, required: true },
  destinationId: { type: String, ref: 'Destination', required: true, unique: true },
  stateId: { type: String, ref: 'State', required: true },
  overallRating: { type: Number, min: 1, max: 5, default: 4 },
  safetyNotes: [{ type: String }],
  advisories: [{ type: String }],
  lastUpdated: { type: Date, default: Date.now },
  emergencyContacts: [{
    type: { type: String, enum: ['police', 'hospital', 'fire', 'tourist_helpline', 'ambulance'] },
    number: { type: String },
    available24h: { type: Boolean, default: true }
  }],
  provenance: { type: provenanceSchema, required: true }
}, { timestamps: true, collection: 'destination_safety' });

module.exports = mongoose.models.DestinationSafety || mongoose.model('DestinationSafety', destinationSafetySchema, 'destination_safety');
