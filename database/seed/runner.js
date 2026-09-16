'use strict';
const mongoose = require('mongoose');
const models = require('../models');

const states = require('./data/statesData');
const generateDestinations = require('./generators/destinationsGenerator');
const generateAttractions = require('./generators/attractionsGenerator');
const generateAccommodations = require('./generators/accommodationsGenerator');
const generatePilgrimageSites = require('./generators/pilgrimageGenerator');
const generateTransportData = require('./generators/transportGenerator');
const generateItineraries = require('./generators/itinerariesGenerator');
const generateMetaData = require('./generators/metaGenerator');

async function bulkUpsert(model, docs, batchSize = 300) {
  const collectionName = model.collection.name;
  let totalUpserted = 0;

  for (let i = 0; i < docs.length; i += batchSize) {
    const batch = docs.slice(i, i + batchSize);
    const ops = batch.map(doc => ({
      updateOne: {
        filter: { _id: doc._id },
        update: { $set: doc },
        upsert: true
      }
    }));

    try {
      const res = await model.bulkWrite(ops, { ordered: false });
      totalUpserted += (res.upsertedCount || 0) + (res.modifiedCount || 0) + (res.matchedCount || 0);
    } catch (err) {
      console.error(`Error during bulkWrite on ${collectionName}:`, err.message);
      throw err;
    }
  }

  const liveCount = await model.countDocuments();
  console.log(`[SEED] ${collectionName.padEnd(22)}: Target ${String(docs.length).padStart(5)} | Live in DB: ${liveCount}`);
  return liveCount;
}

async function runSeed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('[ERROR] MONGODB_URI environment variable is not defined.');
    process.exit(1);
  }

  const dbName = process.env.MONGODB_DB_NAME || 'travelgenie';

  console.log(`Connecting to MongoDB (Database: ${dbName})...`);
  await mongoose.connect(uri, { dbName: dbName });
  console.log('MongoDB connection established successfully.');

  console.log('\n--- Generating Synthetic Data ---');
  const destinations = generateDestinations();
  const attractions = generateAttractions();
  const accommodations = generateAccommodations();
  const pilgrimageSites = generatePilgrimageSites();
  const transport = generateTransportData();
  const itineraries = generateItineraries();
  const meta = generateMetaData();

  console.log('\n--- Seeding Collections Idempotently ---');

  // 1. States
  await bulkUpsert(models.State, states);

  // 2. Destinations
  await bulkUpsert(models.Destination, destinations);

  // 3. Attractions
  await bulkUpsert(models.Attraction, attractions);

  // 4. Accommodations
  await bulkUpsert(models.Accommodation, accommodations);

  // 5. Pilgrimage Sites
  await bulkUpsert(models.PilgrimageSite, pilgrimageSites);

  // 6. Airports
  await bulkUpsert(models.Airport, transport.airports);

  // 7. Railway Stations
  await bulkUpsert(models.RailwayStation, transport.railwayStations);

  // 8. Bus Terminals
  await bulkUpsert(models.BusTerminal, transport.busTerminals);

  // 9. Flights
  await bulkUpsert(models.Flight, transport.flights);

  // 10. Trains
  await bulkUpsert(models.Train, transport.trains);

  // 11. Buses
  await bulkUpsert(models.Bus, transport.buses);

  // 12. Transport Routes
  await bulkUpsert(models.TransportRoute, transport.transportRoutes);

  // 13. Itinerary Templates
  await bulkUpsert(models.ItineraryTemplate, itineraries.itineraryTemplates);

  // 14. Travel Packages
  await bulkUpsert(models.TravelPackage, itineraries.travelPackages);

  // 15. Tags
  await bulkUpsert(models.Tag, meta.tags);

  // 16. Destination Seasons
  await bulkUpsert(models.DestinationSeason, meta.destinationSeasons);

  // 17. Destination Safety
  await bulkUpsert(models.DestinationSafety, meta.destinationSafety);

  console.log('\n--- Ensuring 2dsphere and Compound Indexes ---');
  for (const [modelName, model] of Object.entries(models)) {
    try {
      await model.syncIndexes();
      console.log(`[INDEX] Synced indexes for ${model.collection.name}`);
    } catch (idxErr) {
      console.warn(`[INDEX WARNING] Could not sync index for ${model.collection.name}:`, idxErr.message);
    }
  }

  console.log('\nAll 17 collections seeded and verified successfully!');
  await mongoose.disconnect();
}

if (require.main === module) {
  runSeed().catch(err => {
    console.error('Fatal seed failure:', err);
    process.exit(1);
  });
}

module.exports = runSeed;
