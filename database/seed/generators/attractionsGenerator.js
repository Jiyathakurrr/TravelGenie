'use strict';
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

const attractionTemplates = [
  { name: 'Heritage Fort & Ramparts', type: 'fort', budget: 'budget', adult: 50, duration: 150 },
  { name: 'Royal Palace Museum', type: 'palace', budget: 'mid', adult: 100, duration: 120 },
  { name: 'Ancient Temple Complex', type: 'temple', budget: 'free', adult: 0, duration: 90 },
  { name: 'Panoramic Hill Viewpoint', type: 'viewpoint', budget: 'free', adult: 0, duration: 60 },
  { name: 'Botanical Gardens & Lake', type: 'garden', budget: 'budget', adult: 30, duration: 90 },
  { name: 'Cultural Arts & Crafts Bazaar', type: 'market', budget: 'budget', adult: 0, duration: 120 },
  { name: 'Cascading Waterfalls', type: 'waterfall', budget: 'budget', adult: 20, duration: 120 },
  { name: 'Historic Memorial Monument', type: 'monument', budget: 'budget', adult: 40, duration: 75 },
  { name: 'Wildlife & Nature Reserve', type: 'wildlife', budget: 'mid', adult: 150, duration: 180 },
  { name: 'Sacred Cave Shrines', type: 'cave', budget: 'budget', adult: 25, duration: 100 },
  { name: 'Serene Sunset Beach', type: 'beach', budget: 'free', adult: 0, duration: 90 },
  { name: 'Adventure Outdoor Park', type: 'adventure', budget: 'mid', adult: 200, duration: 240 }
];

function generateAttractions() {
  const destinations = generateDestinations();
  const attractions = [];
  const seenSlugs = new Set();

  destinations.forEach((dest, destIdx) => {
    // Destinations at index 0 or 1 in each state are major destinations -> get 10 attractions
    // Others get 3 attractions
    const isMajor = (destIdx % 12 === 0 || destIdx % 12 === 1);
    const count = isMajor ? 10 : 3;

    for (let i = 0; i < count; i++) {
      const tmpl = attractionTemplates[(i + destIdx) % attractionTemplates.length];
      const attrName = `${dest.name} ${tmpl.name}`;
      let slug = slugify(`attr-${attrName}`);
      if (seenSlugs.has(slug)) {
        slug = `${slug}-${destIdx}-${i}`;
      }
      seenSlugs.add(slug);

      // Coordinates slight offset from destination
      const offsetLng = (((i * 11) % 9) - 4) * 0.005;
      const offsetLat = (((i * 13) % 9) - 4) * 0.005;
      const lng = Number((dest.location.coordinates[0] + offsetLng).toFixed(4));
      const lat = Number((dest.location.coordinates[1] + offsetLat).toFixed(4));

      attractions.push({
        _id: `attr-${slug}`,
        destinationId: dest._id,
        stateId: dest.stateId,
        name: attrName,
        slug: slug,
        description: `Explore ${attrName} in ${dest.name}, an iconic ${tmpl.type.replace('_', ' ')} showcasing regional architecture and natural wonder.`,
        type: tmpl.type,
        location: {
          type: 'Point',
          coordinates: [lng, lat]
        },
        entryFee: {
          adult: tmpl.adult,
          child: Math.round(tmpl.adult * 0.5),
          foreign: tmpl.adult > 0 ? tmpl.adult * 6 : 0,
          currency: 'INR'
        },
        openingHours: '09:00 AM - 06:00 PM',
        estimatedDurationMins: tmpl.duration,
        budgetCategory: tmpl.budget,
        images: [{
          url: `${IMG_BASE}_${slug}.jpg`,
          publicId: `placeholder_${slug}`,
          altText: `${attrName} view`,
          type: 'hero'
        }],
        tags: [tmpl.type, tmpl.budget, 'sightseeing', 'heritage'],
        nearbyAttractionIds: [],
        provenance: PROV,
        isActive: true
      });
    }
  });

  return attractions;
}

module.exports = generateAttractions;
