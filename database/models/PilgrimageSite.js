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

const pilgrimageSiteSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  name: { type: String, required: true },
  slug: { type: String, unique: true, required: true },
  stateId: { type: String, ref: 'State', required: true },
  destinationId: { type: String, ref: 'DestinationCatalog', required: true },
  religion: { type: String, enum: ['Hindu', 'Muslim', 'Sikh', 'Christian', 'Buddhist', 'Jain', 'Other'], required: true },
  type: { type: String, enum: ['temple', 'mosque', 'church', 'gurudwara', 'monastery', 'shrine', 'dargah', 'synagogue', 'fire_temple', 'other'], required: true },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }
  },
  deity: { type: String, default: '' },
  description: { type: String, default: '' },
  significance: { type: String, default: '' },
  classificationStatus: { type: String, enum: ['locally-recognized', 'state-recognized', 'ASI-protected', 'UNESCO-listed', 'unverified'], default: 'state-recognized' },
  classificationSource: { type: String, default: 'State Tourism / Archaeological Survey' },
  visitorsPerYear: { type: Number, default: 100000 },
  entryFee: {
    adult: { type: Number, default: 0 },
    child: { type: Number, default: 0 },
    foreign: { type: Number, default: 0 },
    currency: { type: String, default: 'INR' }
  },
  dressCode: { type: String, default: 'Modest traditional attire recommended' },
  images: [imageSchema],
  provenance: { type: provenanceSchema, required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true, collection: 'pilgrimage_sites' });

pilgrimageSiteSchema.index({ location: '2dsphere' });
pilgrimageSiteSchema.index({ stateId: 1, religion: 1 });

module.exports = mongoose.models.PilgrimageSite || mongoose.model('PilgrimageSite', pilgrimageSiteSchema, 'pilgrimage_sites');
