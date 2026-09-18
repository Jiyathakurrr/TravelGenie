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

const railwayStationSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  stateId: { type: String, ref: 'State', required: true },
  destinationId: { type: String, ref: 'DestinationCatalog' },
  name: { type: String, required: true },
  stationCode: { type: String, unique: true, uppercase: true, required: true },
  city: { type: String, required: true },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }
  },
  zone: { type: String, default: 'Indian Railways' },
  platforms: { type: Number, default: 4 },
  type: { type: String, enum: ['junction', 'terminus', 'halt', 'major', 'minor'], default: 'major' },
  images: [imageSchema],
  provenance: { type: provenanceSchema, required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true, collection: 'railway_stations' });

railwayStationSchema.index({ location: '2dsphere' });

module.exports = mongoose.models.RailwayStation || mongoose.model('RailwayStation', railwayStationSchema, 'railway_stations');
