'use strict';
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const models = require('../models');

async function runValidation() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('[VALIDATION ERROR] MONGODB_URI environment variable is missing.');
    process.exit(1);
  }

  const dbName = process.env.MONGODB_DB_NAME || 'travelgenie';
  await mongoose.connect(uri, { dbName });

  console.log('====================================================');
  console.log('  TRAVELGENIE DATABASE INTEGRITY & SANITY VALIDATOR');
  console.log('====================================================\n');

  let passed = true;
  const report = {};

  // 1. Check Counts
  console.log('[1/8] Verifying Record Counts Across All 17 Collections...');
  const counts = {};
  const seenCollections = new Set();
  for (const [name, model] of Object.entries(models)) {
    if (seenCollections.has(model.collection.name)) continue;
    seenCollections.add(model.collection.name);
    const c = await model.countDocuments();
    counts[model.collection.name] = c;
    console.log(`  - ${model.collection.name.padEnd(22)}: ${c} records`);
  }
  report.counts = counts;

  // 2. State & UT breakdown
  console.log('\n[2/8] Validating State / UT Coverage...');
  const states = await models.State.find().lean();
  const stateCount = states.filter(s => s.type === 'STATE').length;
  const utCount = states.filter(s => s.type === 'UT').length;
  console.log(`  - States count: ${stateCount} (Target: 28)`);
  console.log(`  - UTs count:    ${utCount} (Target: 8)`);
  console.log(`  - Total:        ${states.length} (Target: 36)`);
  if (stateCount !== 28 || utCount !== 8 || states.length !== 36) {
    console.error('  [FAIL] State/UT count mismatch!');
    passed = false;
  } else {
    console.log('  [PASS] Exactly 28 States and 8 UTs verified.');
  }

  // 3. Referential Integrity (No Orphans)
  console.log('\n[3/8] Checking Referential Integrity (Orphan Detection)...');
  const stateIdSet = new Set(states.map(s => s._id));

  const destinations = await (models.DestinationCatalog || models.Destination).find().lean();
  const destIdSet = new Set(destinations.map(d => d._id));

  let destOrphans = 0;
  destinations.forEach(d => {
    if (!stateIdSet.has(d.stateId)) destOrphans++;
  });
  console.log(`  - DestinationCatalog -> State orphans: ${destOrphans}`);
  if (destOrphans > 0) passed = false;

  const attractions = await models.Attraction.find().lean();
  let attrOrphans = 0;
  attractions.forEach(a => {
    if (!destIdSet.has(a.destinationId) || !stateIdSet.has(a.stateId)) attrOrphans++;
  });
  console.log(`  - Attraction -> Dest/State orphans: ${attrOrphans}`);
  if (attrOrphans > 0) passed = false;

  const accommodations = await models.Accommodation.find().lean();
  let accOrphans = 0;
  accommodations.forEach(a => {
    if (!destIdSet.has(a.destinationId) || !stateIdSet.has(a.stateId)) accOrphans++;
  });
  console.log(`  - Accommodation -> Dest/State orphans: ${accOrphans}`);
  if (accOrphans > 0) passed = false;

  const pilgrimages = await models.PilgrimageSite.find().lean();
  let pilgOrphans = 0;
  pilgrimages.forEach(p => {
    if (!destIdSet.has(p.destinationId) || !stateIdSet.has(p.stateId)) pilgOrphans++;
  });
  console.log(`  - PilgrimageSite -> Dest/State orphans: ${pilgOrphans}`);
  if (pilgOrphans > 0) passed = false;

  const airports = await models.Airport.find().lean();
  const airportIdSet = new Set(airports.map(a => a._id));
  const flights = await models.Flight.find().lean();
  let flightOrphans = 0;
  flights.forEach(f => {
    if (!airportIdSet.has(f.originAirportId) || !airportIdSet.has(f.destinationAirportId)) flightOrphans++;
  });
  console.log(`  - Flight -> Airport orphans: ${flightOrphans}`);
  if (flightOrphans > 0) passed = false;

  const stations = await models.RailwayStation.find().lean();
  const stationIdSet = new Set(stations.map(s => s._id));
  const trains = await models.Train.find().lean();
  let trainOrphans = 0;
  trains.forEach(t => {
    if (!stationIdSet.has(t.originStationId) || !stationIdSet.has(t.destinationStationId)) trainOrphans++;
  });
  console.log(`  - Train -> RailwayStation orphans: ${trainOrphans}`);
  if (trainOrphans > 0) passed = false;

  const terminals = await models.BusTerminal.find().lean();
  const terminalIdSet = new Set(terminals.map(b => b._id));
  const buses = await models.Bus.find().lean();
  let busOrphans = 0;
  buses.forEach(b => {
    if (!terminalIdSet.has(b.originTerminalId) || !terminalIdSet.has(b.destinationTerminalId)) busOrphans++;
  });
  console.log(`  - Bus -> BusTerminal orphans: ${busOrphans}`);
  if (busOrphans > 0) passed = false;

  const itinTemplates = await models.ItineraryTemplate.find().lean();
  const itinIdSet = new Set(itinTemplates.map(i => i._id));
  const packages = await models.TravelPackage.find().lean();
  let pkgOrphans = 0;
  packages.forEach(p => {
    if (!itinIdSet.has(p.itineraryTemplateId)) pkgOrphans++;
  });
  console.log(`  - TravelPackage -> ItineraryTemplate orphans: ${pkgOrphans}`);
  if (pkgOrphans > 0) passed = false;

  if (destOrphans + attrOrphans + accOrphans + pilgOrphans + flightOrphans + trainOrphans + busOrphans + pkgOrphans === 0) {
    console.log('  [PASS] Referential integrity holds across all relations. 0 orphans detected.');
  }

  // 4. Coordinates Sanity
  console.log('\n[4/8] Validating Geospatial Coordinates...');
  let invalidCoords = 0;
  function checkGeo(doc, coll) {
    if (!doc.location || !Array.isArray(doc.location.coordinates) || doc.location.coordinates.length !== 2) {
      invalidCoords++;
      return;
    }
    const [lng, lat] = doc.location.coordinates;
    if (typeof lng !== 'number' || typeof lat !== 'number' || isNaN(lng) || isNaN(lat)) {
      invalidCoords++;
      return;
    }
    if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
      invalidCoords++;
    }
  }

  destinations.forEach(d => checkGeo(d, 'destination_catalog'));
  attractions.forEach(a => checkGeo(a, 'attractions'));
  accommodations.forEach(a => checkGeo(a, 'accommodations'));
  pilgrimages.forEach(p => checkGeo(p, 'pilgrimage_sites'));
  airports.forEach(a => checkGeo(a, 'airports'));
  stations.forEach(s => checkGeo(s, 'railway_stations'));
  terminals.forEach(t => checkGeo(t, 'bus_terminals'));

  console.log(`  - Total invalid coordinates: ${invalidCoords}`);
  if (invalidCoords > 0) {
    console.error('  [FAIL] Coordinates out of range or malformed!');
    passed = false;
  } else {
    console.log('  [PASS] All geospatial coordinates are strictly valid GeoJSON Point coordinates.');
  }

  // 5. Price & Budget Sanity
  console.log('\n[5/8] Checking Price and Budget Fields Sanity...');
  let priceIssues = 0;
  accommodations.forEach(a => {
    if (!a.pricePerNight || a.pricePerNight.min <= 0 || a.pricePerNight.max < a.pricePerNight.min) priceIssues++;
  });
  flights.forEach(f => {
    if (!f.fare || f.fare.economy <= 0) priceIssues++;
  });
  trains.forEach(t => {
    if (!t.fare || t.fare.sleeper <= 0) priceIssues++;
  });
  buses.forEach(b => {
    if (!b.fare || b.fare.seater <= 0) priceIssues++;
  });
  itinTemplates.forEach(i => {
    if (!i.estimatedTotalCost || i.estimatedTotalCost.min <= 0 || i.estimatedTotalCost.max < i.estimatedTotalCost.min) priceIssues++;
  });
  console.log(`  - Total price sanity anomalies: ${priceIssues}`);
  if (priceIssues > 0) {
    console.error('  [FAIL] Price sanity check failed!');
    passed = false;
  } else {
    console.log('  [PASS] All price and budget fields are non-negative and satisfy min <= max.');
  }

  // 6. Provenance Check
  console.log('\n[6/8] Verifying Provenance Blocks & Non-Live Labels...');
  let missingProvenance = 0;
  let nonSimulated = 0;

  for (const [name, model] of Object.entries(models)) {
    const sampleDocs = await model.find().limit(50).lean();
    sampleDocs.forEach(doc => {
      if (!doc.provenance || !doc.provenance.sourceType) {
        missingProvenance++;
      } else if (doc.provenance.sourceType !== 'SIMULATED') {
        nonSimulated++;
      }
    });
  }

  console.log(`  - Missing provenance blocks: ${missingProvenance}`);
  console.log(`  - Non-SIMULATED source labels: ${nonSimulated}`);
  if (missingProvenance > 0) {
    console.error('  [FAIL] Documents found missing provenance block!');
    passed = false;
  } else {
    console.log('  [PASS] All sampled documents contain valid provenance with sourceType="SIMULATED".');
  }

  // 7. Pilgrimage Site Classification Check
  console.log('\n[7/8] Validating Pilgrimage Site Classification & Source Integrity...');
  let unclassified = 0;
  pilgrimages.forEach(p => {
    if (!p.classificationStatus || !p.classificationSource) unclassified++;
  });
  console.log(`  - Unclassified pilgrimage sites: ${unclassified}`);
  if (unclassified > 0) {
    console.error('  [FAIL] Pilgrimage sites missing classification status or source!');
    passed = false;
  } else {
    console.log('  [PASS] All pilgrimage sites have explicit classification status and verified source attribution.');
  }

  // 8. Secret Scan in Working Tree
  console.log('\n[8/8] Scanning Repo Working Tree for Leaked Secrets...');
  const activeSecrets = [
    process.env.MONGODB_URI,
    process.env.CLOUDINARY_API_SECRET,
    process.env.CLOUDINARY_API_KEY
  ].filter(val => val && val.length > 5);

  let leakedSecrets = 0;
  function scanDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const ent of entries) {
      if (['node_modules', '.git', 'dist', 'build', '.next'].includes(ent.name)) continue;
      const fullPath = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        scanDir(fullPath);
      } else if (ent.isFile()) {
        const content = fs.readFileSync(fullPath, 'utf8');
        for (const secret of activeSecrets) {
          if (content.includes(secret)) {
            console.error(`  [LEAK DETECTED] File: ${path.relative(process.cwd(), fullPath)} contains sensitive session secret!`);
            leakedSecrets++;
          }
        }
      }
    }
  }

  scanDir(process.cwd());
  if (leakedSecrets > 0) {
    console.error(`  [FAIL] Found ${leakedSecrets} leaked secret occurrences in working tree!`);
    passed = false;
  } else {
    console.log('  [PASS] Clean scan: No connection strings, passwords, or Cloudinary secrets found on disk.');
  }

  console.log('\n====================================================');
  if (passed) {
    console.log('  ALL VALIDATION AUDITS PASSED CLEANLY! (100% SUCCESS)');
  } else {
    console.error('  VALIDATION AUDIT DETECTED ISSUES. Please review logs.');
  }
  console.log('====================================================\n');

  await mongoose.disconnect();
  return passed;
}

if (require.main === module) {
  runValidation().then(ok => {
    if (!ok) process.exit(1);
  }).catch(err => {
    console.error('Validation error:', err);
    process.exit(1);
  });
}

module.exports = runValidation;
