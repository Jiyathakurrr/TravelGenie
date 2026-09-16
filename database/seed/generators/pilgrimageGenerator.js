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

const religiousTemplates = [
  { religion: 'Hindu', type: 'temple', prefix: 'Sri Maha Shiva Temple', deity: 'Lord Shiva', classification: 'state-recognized', source: 'State Dept of Religious Endowments' },
  { religion: 'Hindu', type: 'temple', prefix: 'Vishnu Narayana Temple', deity: 'Lord Vishnu', classification: 'locally-recognized', source: 'District Temple Trust' },
  { religion: 'Hindu', type: 'temple', prefix: 'Durga Devi Mandir', deity: 'Goddess Durga', classification: 'state-recognized', source: 'State Tourism & Heritage Trust' },
  { religion: 'Muslim', type: 'mosque', prefix: 'Jama Masjid & Minarets', deity: 'Allah', classification: 'ASI-protected', source: 'Archaeological Survey of India' },
  { religion: 'Muslim', type: 'dargah', prefix: 'Hazrat Sufi Dargah Sharif', deity: 'Sufi Saint', classification: 'locally-recognized', source: 'State Waqf Board Records' },
  { religion: 'Sikh', type: 'gurudwara', prefix: 'Gurudwara Sahib Heritage', deity: 'Guru Granth Sahib', classification: 'state-recognized', source: 'Shiromani Gurdwara Prabandhak Committee' },
  { religion: 'Christian', type: 'church', prefix: 'St. Mary Cathedral Basilica', deity: 'Jesus Christ', classification: 'state-recognized', source: 'Diocese Heritage Records' },
  { religion: 'Christian', type: 'church', prefix: 'Sacred Heart Church', deity: 'Jesus Christ', classification: 'locally-recognized', source: 'Parish Council Archive' },
  { religion: 'Buddhist', type: 'monastery', prefix: 'Buddha Vihara Mahayana Monastery', deity: 'Gautama Buddha', classification: 'UNESCO-listed', source: 'Buddhist Heritage Board / State Tourism' },
  { religion: 'Jain', type: 'temple', prefix: 'Shri Parshvanath Jain Derasar', deity: 'Tirthankara Parshvanath', classification: 'state-recognized', source: 'Jain Temple Trust' }
];

function generatePilgrimageSites() {
  const destinations = generateDestinations();
  const sites = [];
  const seenSlugs = new Set();

  const destsByState = {};
  for (const d of destinations) {
    if (!destsByState[d.stateId]) destsByState[d.stateId] = [];
    destsByState[d.stateId].push(d);
  }

  for (const state of states) {
    const stateDests = destsByState[state._id] || [];
    if (stateDests.length === 0) continue;

    // 15 sites per state/UT -> 36 * 15 = 540 total pilgrimage sites!
    for (let i = 0; i < 15; i++) {
      const dest = stateDests[i % stateDests.length];
      const tmpl = religiousTemplates[i % religiousTemplates.length];
      const siteName = `${dest.name} ${tmpl.prefix} #${Math.floor(i / religiousTemplates.length) + 1}`;
      let slug = slugify(`pilg-${siteName}`);
      if (seenSlugs.has(slug)) {
        slug = `${slug}-${state.code}-${i}`;
      }
      seenSlugs.add(slug);

      const offsetLng = (((i * 9) % 13) - 6) * 0.003;
      const offsetLat = (((i * 13) % 13) - 6) * 0.003;
      const lng = Number((dest.location.coordinates[0] + offsetLng).toFixed(4));
      const lat = Number((dest.location.coordinates[1] + offsetLat).toFixed(4));

      sites.push({
        _id: `pilg-${slug}`,
        name: siteName,
        slug: slug,
        stateId: state._id,
        destinationId: dest._id,
        religion: tmpl.religion,
        type: tmpl.type,
        location: {
          type: 'Point',
          coordinates: [lng, lat]
        },
        deity: tmpl.deity,
        description: `${siteName} is a revered sanctuary in ${dest.name}, attracting devout pilgrims and architecture admirers from across the nation.`,
        significance: `Celebrated spiritual center embodying historic community devotion and architectural grandeur.`,
        classificationStatus: tmpl.classification,
        classificationSource: tmpl.source,
        visitorsPerYear: 50000 + ((i * 17000) % 300000),
        entryFee: {
          adult: 0,
          child: 0,
          foreign: 0,
          currency: 'INR'
        },
        dressCode: 'Modest attire covering shoulders and knees is recommended upon entry.',
        images: [{
          url: `${IMG_BASE}_${slug}.jpg`,
          publicId: `placeholder_${slug}`,
          altText: `${siteName} sanctum in ${dest.name}`,
          type: 'hero'
        }],
        provenance: PROV,
        isActive: true
      });
    }
  }

  return sites;
}

module.exports = generatePilgrimageSites;
