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

const activitySchema = new mongoose.Schema({
  time: { type: String, default: '10:00 AM' },
  activityType: { type: String, enum: ['sightseeing', 'adventure', 'cultural', 'religious', 'food', 'shopping', 'relaxation', 'transit', 'accommodation'], default: 'sightseeing' },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  attractionId: { type: String, ref: 'Attraction' },
  estimatedCost: { type: Number, default: 0 },
  durationMins: { type: Number, default: 90 }
}, { _id: false });

const daySchema = new mongoose.Schema({
  dayNumber: { type: Number, required: true },
  title: { type: String, required: true },
  activities: [activitySchema]
}, { _id: false });

const itineraryTemplateSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  title: { type: String, required: true },
  slug: { type: String, unique: true, required: true },
  destinationIds: [{ type: String, ref: 'DestinationCatalog' }],
  stateIds: [{ type: String, ref: 'State' }],
  durationDays: { type: Number, required: true },
  theme: { type: String, enum: ['adventure', 'cultural', 'religious', 'nature', 'beach', 'heritage', 'family', 'honeymoon', 'solo', 'luxury', 'budget', 'wildlife', 'pilgrimage'], default: 'cultural' },
  days: [daySchema],
  estimatedTotalCost: {
    min: { type: Number, required: true },
    max: { type: Number, required: true }
  },
  estimatedDailyBudget: { type: Number, required: true },
  budgetCategory: { type: String, enum: ['budget', 'mid', 'luxury', 'ultra-luxury'], default: 'mid' },
  estimatedTransportCost: { type: Number, default: 2000 },
  estimatedFoodCost: { type: Number, default: 1500 },
  estimatedActivityCost: { type: Number, default: 1000 },
  currency: { type: String, default: 'INR' },
  difficulty: { type: String, enum: ['easy', 'moderate', 'challenging'], default: 'easy' },
  tags: [{ type: String }],
  images: [imageSchema],
  provenance: { type: provenanceSchema, required: true }
}, { timestamps: true, collection: 'itinerary_templates' });

itineraryTemplateSchema.index({ theme: 1, durationDays: 1 });

module.exports = mongoose.models.ItineraryTemplate || mongoose.model('ItineraryTemplate', itineraryTemplateSchema, 'itinerary_templates');
