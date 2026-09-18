'use strict';
const generateDestinations = require('./destinationsGenerator');

const PROV = {
  sourceType: 'SIMULATED',
  sourceName: 'TravelGenie Synthetic Generator',
  dataVersion: '1.0.0',
  lastVerifiedAt: new Date('2026-01-01')
};

function slugify(text) {
  return text.toString().toLowerCase().trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

const tagList = [
  { name: 'Hill Station', cat: 'destination', desc: 'Serene elevated towns with temperate mountain climates' },
  { name: 'Beach Paradise', cat: 'destination', desc: 'Sun-drenched coastlines and tropical waters' },
  { name: 'Ancient Heritage', cat: 'culture', desc: 'Centuries-old monuments, forts, and historic landmarks' },
  { name: 'Wildlife Sanctuary', cat: 'nature', desc: 'Protected biodiversity reserves and tiger corridors' },
  { name: 'Spiritual Sanctum', cat: 'religion', desc: 'Sacred temples, shrines, and pilgrimage hubs' },
  { name: 'Adventure Trekking', cat: 'experience', desc: 'High-altitude trails and adrenaline-pumping expeditions' },
  { name: 'Royal Palace', cat: 'attraction', desc: 'Magnificent palaces of erstwhile kings and maharajas' },
  { name: 'Luxury Resort', cat: 'accommodation', desc: 'Opulent hospitality stays with world-class wellness amenities' },
  { name: 'Eco Homestay', cat: 'accommodation', desc: 'Warm local hospitality rooted in regional village charm' },
  { name: 'Water Sports', cat: 'experience', desc: 'Scuba diving, parasailing, kayaking, and jet skiing' },
  { name: 'Culinary Trail', cat: 'food', desc: 'Authentic local street flavors and royal banquet recipes' },
  { name: 'Scenic Waterfall', cat: 'nature', desc: 'Majestic waterfalls set amidst verdant rainforests' },
  { name: 'High Speed Train', cat: 'transport', desc: 'Vande Bharat and Shatabdi Express connectivity' },
  { name: 'Scenic Flight', cat: 'transport', desc: 'Aerial views over snowpeaks and tropical coastlines' },
  { name: 'Romantic Getaway', cat: 'theme', desc: 'Idyllic destinations ideal for honeymoon couples' },
  { name: 'Family Friendly', cat: 'theme', desc: 'Safe, accessible attractions enjoyable across all age groups' },
  { name: 'Solo Backpacking', cat: 'theme', desc: 'Budget-friendly routes with vibrant backpacker communities' },
  { name: 'Yoga & Wellness', cat: 'experience', desc: 'Ayurvedic retreats and Himalayan meditation centers' },
  { name: 'Handicrafts & Bazaars', cat: 'culture', desc: 'Traditional handloom textiles and bronze art' },
  { name: 'Desert Safari', cat: 'experience', desc: 'Golden sand dunes and starlit camel camping' },
  { name: 'River Cruise', cat: 'experience', desc: 'Houseboats and river voyages along backwaters' },
  { name: 'Cave Exploration', cat: 'nature', desc: 'Subterranean limestone formations and prehistoric rock art' },
  { name: 'Birdwatching', cat: 'nature', desc: 'Wetlands harboring rare migratory avifauna' },
  { name: 'Festival Celebration', cat: 'culture', desc: 'Vibrant local festivities filled with music, dance, and folk joy' }
];

function generateMetaData() {
  const destinations = generateDestinations();

  // 1. Tags
  const tags = tagList.map(t => {
    const slug = slugify(t.name);
    return {
      _id: `tag-${slug}`,
      name: t.name,
      slug: slug,
      category: t.cat,
      description: t.desc,
      usageCount: 15 + ((t.name.length * 7) % 80),
      provenance: PROV
    };
  });

  // 2. Destination Seasons (1 doc per destination)
  const destinationSeasons = destinations.map((dest, idx) => {
    const isCold = dest.type === 'hill_station';
    return {
      _id: `season-${dest._id}`,
      destinationId: dest._id,
      stateId: dest.stateId,
      peakSeason: [
        { month: 10, rating: 5, weather: 'Clear & Crisp', crowdLevel: 'high', priceMultiplier: 1.25 },
        { month: 11, rating: 5, weather: 'Pleasant Autumn', crowdLevel: 'very_high', priceMultiplier: 1.4 },
        { month: 12, rating: 5, weather: 'Chilly Festive', crowdLevel: 'very_high', priceMultiplier: 1.5 },
        { month: 1, rating: 4, weather: 'Winter Cool', crowdLevel: 'high', priceMultiplier: 1.3 },
        { month: 2, rating: 4, weather: 'Mild Spring', crowdLevel: 'moderate', priceMultiplier: 1.1 }
      ],
      offSeason: [5, 6, 7],
      monsoonMonths: [7, 8, 9],
      snowMonths: isCold ? [12, 1, 2] : [],
      bestFor: ['Sightseeing', 'Outdoor Photography', 'Cultural Festivals', 'Nature Walks'],
      provenance: PROV
    };
  });

  // 3. Destination Safety (1 doc per destination)
  const destinationSafety = destinations.map((dest, idx) => {
    return {
      _id: `safety-${dest._id}`,
      destinationId: dest._id,
      stateId: dest.stateId,
      overallRating: 4 + (idx % 2 === 0 ? 0.5 : 0),
      safetyNotes: [
        'Active 24/7 tourist assistance police booths at major attractions',
        'Hospitality staff and local cab aggregators are background-verified',
        'Well-marked emergency exit points and pedestrian corridors'
      ],
      advisories: [
        'Keep emergency helpline numbers saved in your mobile phone',
        'Verify trekking guide credentials before remote trail excursions',
        'Carry bottled drinking water during high summer afternoon hours'
      ],
      lastUpdated: new Date('2026-01-15'),
      emergencyContacts: [
        { type: 'police', number: '112', available24h: true },
        { type: 'tourist_helpline', number: '1363', available24h: true },
        { type: 'ambulance', number: '108', available24h: true },
        { type: 'fire', number: '101', available24h: true }
      ],
      provenance: PROV
    };
  });

  return {
    tags,
    destinationSeasons,
    destinationSafety
  };
}

module.exports = generateMetaData;
