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

const themes = ['cultural', 'heritage', 'adventure', 'wildlife', 'beach', 'pilgrimage', 'honeymoon', 'nature', 'family', 'luxury'];
const difficulties = ['easy', 'moderate', 'challenging'];
const budgetLevels = ['budget', 'mid', 'luxury', 'ultra-luxury'];

function generateItineraries() {
  const destinations = generateDestinations();
  const destMap = {};
  for (const d of destinations) {
    if (!destMap[d.stateId]) destMap[d.stateId] = [];
    destMap[d.stateId].push(d);
  }

  const itineraryTemplates = [];
  const travelPackages = [];
  const seenItinSlugs = new Set();
  const seenPkgSlugs = new Set();

  for (const state of states) {
    const sDests = destMap[state._id] || [];
    if (sDests.length === 0) continue;

    // 6 templates per state/UT -> 36 * 6 = 216 itinerary templates!
    for (let i = 0; i < 6; i++) {
      const theme = themes[(i + state.code.charCodeAt(0)) % themes.length];
      const duration = 3 + (i % 5); // 3 to 7 days
      const dest1 = sDests[i % sDests.length];
      const dest2 = sDests[(i + 1) % sDests.length];
      const pickedDests = dest1._id === dest2._id ? [dest1] : [dest1, dest2];

      const title = `${duration}-Day ${theme.toUpperCase()} Odyssey in ${dest1.name}, ${state.name}`;
      let itinSlug = slugify(`itin-${title}`);
      if (seenItinSlugs.has(itinSlug)) {
        itinSlug = `${itinSlug}-${state.code}-${i}`;
      }
      seenItinSlugs.add(itinSlug);

      const days = [];
      for (let d = 1; d <= duration; d++) {
        const curDest = pickedDests[(d - 1) % pickedDests.length];
        days.push({
          dayNumber: d,
          title: `Day ${d}: Highlights and Exploration of ${curDest.name}`,
          activities: [
            {
              time: '09:00 AM',
              activityType: 'sightseeing',
              name: `Morning Landmark Discovery in ${curDest.name}`,
              description: `Guided walk through the storied architecture and vibrant squares of ${curDest.name}.`,
              estimatedCost: 200,
              durationMins: 120
            },
            {
              time: '01:00 PM',
              activityType: 'food',
              name: `Traditional Culinary Immersion`,
              description: `Savor regional dishes crafted with time-tested recipes and local spices.`,
              estimatedCost: 400,
              durationMins: 60
            },
            {
              time: '03:30 PM',
              activityType: 'cultural',
              name: `Afternoon Cultural & Arts Experience`,
              description: `Interact with local artisans and explore handcrafts or museum galleries.`,
              estimatedCost: 300,
              durationMins: 90
            },
            {
              time: '06:30 PM',
              activityType: 'relaxation',
              name: `Sunset Vistas & Evening Promenade`,
              description: `Unwind with sweeping skyline views and ambient evening performances.`,
              estimatedCost: 0,
              durationMins: 60
            }
          ]
        });
      }

      const budgetCat = budgetLevels[i % budgetLevels.length];
      const dailyCost = budgetCat === 'budget' ? 2200 : budgetCat === 'mid' ? 4500 : 9500;
      const minCost = dailyCost * duration;
      const maxCost = Math.round(minCost * 1.5);

      const itinDoc = {
        _id: `itin-${itinSlug}`,
        title: title,
        slug: itinSlug,
        destinationIds: pickedDests.map(d => d._id),
        stateIds: [state._id],
        durationDays: duration,
        theme: theme === 'nature' ? 'nature' : theme,
        days: days,
        estimatedTotalCost: { min: minCost, max: maxCost },
        estimatedDailyBudget: dailyCost,
        budgetCategory: budgetCat,
        estimatedTransportCost: 1500 * duration,
        estimatedFoodCost: 1000 * duration,
        estimatedActivityCost: 800 * duration,
        currency: 'INR',
        difficulty: difficulties[i % difficulties.length],
        tags: [theme, budgetCat, `${duration}-days`, state.name.toLowerCase()],
        images: [{
          url: `${IMG_BASE}_itin_${itinSlug}.jpg`,
          publicId: `placeholder_itin_${itinSlug}`,
          altText: `${title} preview banner`,
          type: 'hero'
        }],
        provenance: PROV
      };

      itineraryTemplates.push(itinDoc);

      // Create Travel Packages for half the templates -> ~108 packages!
      if (i % 2 === 0) {
        const pkgTitle = `Signature ${title} Tour Package`;
        let pkgSlug = slugify(`pkg-${pkgTitle}`);
        if (seenPkgSlugs.has(pkgSlug)) {
          pkgSlug = `${pkgSlug}-${state.code}-${i}`;
        }
        seenPkgSlugs.add(pkgSlug);

        travelPackages.push({
          _id: `pkg-${pkgSlug}`,
          title: pkgTitle,
          slug: pkgSlug,
          stateIds: [state._id],
          destinationIds: pickedDests.map(d => d._id),
          itineraryTemplateId: itinDoc._id,
          durationDays: duration,
          price: {
            min: Math.round(minCost * 1.15),
            max: Math.round(maxCost * 1.25)
          },
          currency: 'INR',
          budgetCategory: budgetCat,
          inclusions: [
            '3-Star or 4-Star Premium Hotel Accommodations',
            'Daily Gourmet Buffet Breakfast',
            'Dedicated Chauffeur-Driven AC Private Vehicle',
            'Authorized Government Tour Guide Fees',
            'All Tolls, Parking, and Inter-State Taxes'
          ],
          exclusions: [
            'Airfare or Train Tickets to Destination Hub',
            'Monument Entrance Video Camera Permits',
            'Discretionary Tips and Personal Incidental Expenses',
            'Optional Adventure Sports and Activity Add-ons'
          ],
          images: [{
            url: `${IMG_BASE}_pkg_${pkgSlug}.jpg`,
            publicId: `placeholder_pkg_${pkgSlug}`,
            altText: `${pkgTitle} highlight`,
            type: 'hero'
          }],
          tags: [theme, budgetCat, 'packaged-tour', 'featured'],
          provenance: PROV,
          isActive: true
        });
      }
    }
  }

  return {
    itineraryTemplates,
    travelPackages
  };
}

module.exports = generateItineraries;
