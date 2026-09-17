'use strict';
const mongoose = require('mongoose');
const models = require('../models');

async function resetSeedData() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('[RESET ERROR] MONGODB_URI environment variable is missing.');
    process.exit(1);
  }

  const dbName = process.env.MONGODB_DB_NAME || 'travelgenie';
  await mongoose.connect(uri, { dbName });

  console.log('Resetting TravelGenie simulated seed data (Scoped strictly to TravelGenie seed collections)...');
  for (const [name, model] of Object.entries(models)) {
    const res = await model.deleteMany({ 'provenance.sourceType': 'SIMULATED' });
    console.log(`[RESET] ${model.collection.name.padEnd(22)}: deleted ${res.deletedCount} simulated records.`);
  }

  console.log('Scoped reset complete.');
  await mongoose.disconnect();
}

if (require.main === module) {
  resetSeedData().catch(err => {
    console.error('Reset error:', err);
    process.exit(1);
  });
}

module.exports = resetSeedData;
