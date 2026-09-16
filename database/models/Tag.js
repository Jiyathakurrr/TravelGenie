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

const tagSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  name: { type: String, required: true, unique: true },
  slug: { type: String, unique: true, required: true },
  category: { type: String, enum: ['destination', 'attraction', 'accommodation', 'transport', 'experience', 'theme', 'nature', 'culture', 'religion', 'food'], required: true },
  description: { type: String, default: '' },
  usageCount: { type: Number, default: 0 },
  provenance: { type: provenanceSchema, required: true }
}, { timestamps: true, collection: 'tags' });

module.exports = mongoose.models.Tag || mongoose.model('Tag', tagSchema, 'tags');
