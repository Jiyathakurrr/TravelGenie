'use strict';
const states = require('../data/statesData');
const generateDestinations = require('./destinationsGenerator');

const PROV = {
  sourceType: 'SIMULATED',
  sourceName: 'TravelGenie Synthetic Generator',
  dataVersion: '1.0.0',
  lastVerifiedAt: new Date('2026-01-01')
};

const IMG_BASE = 'https://res.cloudinary.com/soootttd/image/upload/v1/placeholder';

function slugify(text) {
  return text.toString().toLowerCase().trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

const accommodationTypes = [
  { type: 'hotel', prefix: 'Grand Palace Hotel', budget: 'mid', stars: 4, minPrice: 3200, maxPrice: 6500 },
  { type: 'resort', prefix: 'Royal Heritage Resort', budget: 'luxury', stars: 5, minPrice: 7500, maxPrice: 16000 },
  { type: 'hostel', prefix: 'Backpackers Haven Hostel', budget: 'budget', stars: 2, minPrice: 600, maxPrice: 1500 },
  { type: 'homestay', prefix: 'Serene Green Homestay', budget: 'budget', stars: 3, minPrice: 1200, maxPrice: 2800 },
  { type: 'boutique', prefix: 'The Signature Boutique Stay', budget: 'luxury', stars: 4, minPrice: 5500, maxPrice: 12000 },
  { type: 'lodge', prefix: 'Comfort Eco Lodge', budget: 'budget', stars: 2, minPrice: 900, maxPrice: 2200 },
  { type: 'villa', prefix: 'Imperial Private Villa', budget: 'ultra-luxury', stars: 5, minPrice: 14000, maxPrice: 32000 },
  { type: 'guesthouse', prefix: 'Sunrise Valley Guesthouse', budget: 'budget', stars: 2, minPrice: 800, maxPrice: 1800 }
];

function generateAccommodations() {
  const destinations = generateDestinations();
  const accommodations = [];
  const seenSlugs = new Set();

  // Group destinations by stateId
  const destsByState = {};
  for (const d of destinations) {
    if (!destsByState[d.stateId]) destsByState[d.stateId] = [];
    destsByState[d.stateId].push(d);
  }

  for (const state of states) {
    const stateDests = destsByState[state._id] || [];
    if (stateDests.length === 0) continue;

    // Generate 28 accommodations per state/UT -> 36 * 28 = 1,008 total
    for (let i = 0; i < 28; i++) {
      const dest = stateDests[i % stateDests.length];
      const tmpl = accommodationTypes[i % accommodationTypes.length];
      const accName = `${dest.name} ${tmpl.prefix} #${Math.floor(i / accommodationTypes.length) + 1}`;
      let slug = slugify(`acc-${accName}`);
      if (seenSlugs.has(slug)) {
        slug = `${slug}-${state.code}-${i}`;
      }
      seenSlugs.add(slug);

      const offsetLng = (((i * 7) % 11) - 5) * 0.004;
      const offsetLat = (((i * 11) % 11) - 5) * 0.004;
      const lng = Number((dest.location.coordinates[0] + offsetLng).toFixed(4));
      const lat = Number((dest.location.coordinates[1] + offsetLat).toFixed(4));

      accommodations.push({
        _id: `acc-${slug}`,
        stateId: state._id,
        destinationId: dest._id,
        name: accName,
        slug: slug,
        type: tmpl.type,
        starRating: tmpl.stars,
        location: {
          type: 'Point',
          coordinates: [lng, lat]
        },
        address: `${10 + i}, Tourism Corridor, ${dest.name}, ${state.name} - 5000${(i % 90) + 10}`,
        pricePerNight: {
          min: tmpl.minPrice,
          max: tmpl.maxPrice
        },
        currency: 'INR',
        budgetCategory: tmpl.budget,
        amenities: ['Wi-Fi', 'Air Conditioning', 'Complimentary Breakfast', '24/7 Room Service', 'Travel Desk'],
        images: [{
          url: `${IMG_BASE}_${slug}.jpg`,
          publicId: `placeholder_${slug}`,
          altText: `${accName} exterior in ${dest.name}`,
          type: 'hero'
        }],
        tags: [tmpl.type, tmpl.budget, 'accommodation', 'verified-stay'],
        nearbyAttractionIds: [],
        checkInTime: '14:00',
        checkOutTime: '11:00',
        provenance: PROV,
        isActive: true
      });
    }
  }

  return accommodations;
}

module.exports = generateAccommodations;
