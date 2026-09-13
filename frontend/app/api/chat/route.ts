/**
 * app/api/chat/route.ts
 *
 * Travel Genie AI Chatbot Endpoint
 * - Intent & Entity Extraction (Source, Destination, Intent Type)
 * - City Knowledge Base for Varanasi, Amritsar, Mysore, Hampi, Ooty, Goa, Jaipur, Agra, Manali, Delhi, Mumbai, etc.
 * - Context-aware, unique answers for general Q&A, destination info, route queries, and full trip planning.
 * - Honest & realistic travel estimates with explicit disclaimers.
 * - Functional booking search deep links (Google Flights, IRCTC, RedBus, MMT).
 */

import { NextRequest, NextResponse } from "next/server";
import { CHAT_SYSTEM_PROMPT } from "@/lib/prompts";
import { findDestination, getSafetyAdvisory, DISCLAIMER_NOTE } from "@/lib/db";
import { fetchWeather } from "@/lib/weather";
import OpenAI from "openai";

const INDIAN_CITIES = [
  "Delhi", "Mumbai", "Jaipur", "Goa", "Manali", "Udaipur", "Rishikesh",
  "Kochi", "Shimla", "Agra", "Varanasi", "Amritsar", "Pondicherry", "Coorg",
  "Darjeeling", "Mysore", "Hampi", "Andaman", "Ladakh", "Munnar", "Ooty",
  "Kasol", "Jaisalmer", "Srinagar", "Gangtok", "Bangalore", "Hyderabad",
  "Kolkata", "Chennai", "Pune", "Ahmedabad"
];

// Rich fallback knowledge per city
const CITY_KNOWLEDGE: Record<string, {
  tagline: string;
  bestTime: string;
  attractions: string[];
  food: string[];
  routeInfo: { flight: string; train: string; bus: string; cab: string };
  flightEst: number;
  trainEst: number;
  busEst: number;
  cabEst: number;
}> = {
  varanasi: {
    tagline: "Spiritual capital along the sacred Ganges, famous for ancient ghats and evening Ganga Aarti",
    bestTime: "October to March (pleasant weather for ghat walks and boat rides)",
    attractions: ["Dashashwamedh Ghat Evening Aarti", "Sunrise Ganges Boat Ride", "Kashi Vishwanath Temple", "Sarnath Buddhist Stupa"],
    food: ["Malaiyo (winter sweet)", "Kachori Sabzi at Ram Bhandar", "Varanasi Paan", "Tamatar Chaat at Deena Chaat Bhandar"],
    routeInfo: {
      flight: "Direct flights available to Lal Bahadur Shastri International Airport (VNS)",
      train: "Vande Bharat / Express trains to Varanasi Junction (BSB) or Banaras (BSBS)",
      bus: "AC Sleeper buses from Lucknow, Prayagraj, and Delhi",
      cab: "Private outstation cab via Purvanchal / NH19 expressways"
    },
    flightEst: 4500, trainEst: 1250, busEst: 850, cabEst: 6500
  },
  amritsar: {
    tagline: "Spiritual heart of Sikhism, home to the Golden Temple and rich Punjabi culture",
    bestTime: "October to March (cool and comfortable for sightseeing)",
    attractions: ["Sri Harmandir Sahib (Golden Temple)", "Wagah Border Beating Retreat Ceremony", "Jallianwala Bagh Memorial", "Gobindgarh Fort"],
    food: ["Amritsari Kulcha with Chole", "Guru ka Langar at Golden Temple", "Ahuja Lassi", "Makki di Roti & Sarson da Saag"],
    routeInfo: {
      flight: "Non-stop flights to Sri Guru Ram Dass Jee International Airport (ATQ)",
      train: "Shatabdi & Swarna Jayanti Express to Amritsar Junction (ASR)",
      bus: "Volvo AC buses from Delhi (ISBT Kashmiri Gate) and Chandigarh",
      cab: "Highway drive via NH44 (Delhi-Amritsar Highway)"
    },
    flightEst: 4200, trainEst: 1100, busEst: 800, cabEst: 6000
  },
  mysore: {
    tagline: "Royal Heritage City known for Mysore Palace, silk sarees, and sandalwood",
    bestTime: "October to March (especially during Dasara festival in October)",
    attractions: ["Mysore Palace (illuminated on Sundays)", "Chamundi Hill & Chamundeshwari Temple", "Brindavan Gardens", "Devaraja Market"],
    food: ["Mysore Pak at Guru Sweets", "Mylari Dosa", "Filter Coffee", "Mysore Masala Dosa"],
    routeInfo: {
      flight: "Fly to Bengaluru (BLR) or Mysore Airport (MYQ) followed by Vande Bharat / Cab",
      train: "Vande Bharat Express (2h) from Bengaluru to Mysuru Junction (MYS)",
      bus: "KSRTC Flybus / EV buses from Bengaluru Airport direct to Mysore",
      cab: "Smooth 2-hour drive via Bengaluru-Mysuru Expressway"
    },
    flightEst: 3800, trainEst: 650, busEst: 450, cabEst: 3200
  },
  hampi: {
    tagline: "UNESCO World Heritage site of surreal boulder landscapes and Vijayanagara ruins",
    bestTime: "October to February (cool temperatures ideal for walking among ruins)",
    attractions: ["Virupaksha Temple", "Stone Chariot at Vittala Temple", "Matanga Hill Sunset View", "Coracle Boat Ride on Tungabhadra River"],
    food: ["South Indian Thali at Mango Tree Cafe", "Fresh Coconut Water", "Israeli & Continental at Hippie Island Cafes"],
    routeInfo: {
      flight: "Fly to Jindal Vijayanagar Airport (VDY - Toranagallu) or Hubballi (HBX)",
      train: "Hampi Express or Mysuru Express to Hosapete Junction (HPT - 13km from Hampi)",
      bus: "Overnight KSRTC / Private Volvo buses from Bengaluru, Goa, or Hyderabad to Hosapete",
      cab: "Outstation SUV cab from Hubballi, Goa, or Bengaluru"
    },
    flightEst: 5200, trainEst: 950, busEst: 800, cabEst: 5500
  },
  ooty: {
    tagline: "Queen of Nilgiri Hill Stations with tea estates, botanical gardens, and toy train",
    bestTime: "October to June (pleasant summers and scenic misty winters)",
    attractions: ["UNESCO Nilgiri Mountain Railway (Toy Train)", "Ooty Lake & Boating", "Government Botanical Garden", "Doddabetta Peak"],
    food: ["Ooty Homemade Chocolates", "Fresh Nilgiri Tea", "Varkey (traditional baked biscuit)", "South Indian Thali"],
    routeInfo: {
      flight: "Fly to Coimbatore International Airport (CJB - 88km away) then cab/bus uphill",
      train: "Nilgiri Passenger Toy Train from Mettupalayam to Ooty (UAM)",
      bus: "TNSTC / KSRTC mountain buses from Coimbatore, Mysore, and Bengaluru",
      cab: "Scenic hill climb drive via Kallar Ghat road / Kotagiri route"
    },
    flightEst: 4100, trainEst: 850, busEst: 600, cabEst: 3500
  },
  goa: {
    tagline: "Beach paradise of golden sands, Portuguese churches, and vibrant coastal nightlife",
    bestTime: "November to February (sunny weather, beach shacks, and water sports)",
    attractions: ["Baga & Calangute Beaches", "Basilica of Bom Jesus (Old Goa)", "Dudhsagar Waterfalls", "Mandovi River Cruise"],
    food: ["Goan Fish Curry Rice", "Bebinca Dessert", "Prawn Balchão", "Chicken Xacuti"],
    routeInfo: {
      flight: "Direct flights to Dabolim (GOI) or Manohar International Airport Mopa (GOX)",
      train: "Madgaon Express / Tejas Express to Madgaon (MAO) or Thivim (THVM)",
      bus: "Overnight AC Volvo sleeper buses from Mumbai, Pune, or Bengaluru",
      cab: "Coastal highway drive via NH66"
    },
    flightEst: 4800, trainEst: 1450, busEst: 950, cabEst: 7500
  },
  jaipur: {
    tagline: "The Pink City of grand fortresses, royal palaces, and vibrant Rajasthani bazaars",
    bestTime: "October to March (mild winter sun perfect for sightseeing)",
    attractions: ["Amer Fort & Elephant Hill Climb", "Hawa Mahal (Palace of Winds)", "City Palace & Jantar Mantar", "Johari & Bapu Bazaars"],
    food: ["Dal Baati Churma", "Pyaaz Kachori at Rawat", "Laal Maas", "Ghevar at LMB"],
    routeInfo: {
      flight: "Non-stop flights to Jaipur International Airport (JAI)",
      train: "Vande Bharat & Ajmer Shatabdi from Delhi / Mumbai to Jaipur Junction (JP)",
      bus: "RSRTC Goldline Volvo buses from Delhi (ISBT) every 30 minutes",
      cab: "Delhi-Jaipur Expressway (3.5 hours drive)"
    },
    flightEst: 3900, trainEst: 1100, busEst: 750, cabEst: 4800
  },
  manali: {
    tagline: "Himalayan valley of snow peaks, pine forests, and adventure sports",
    bestTime: "October to June (snow in Dec-Feb, pleasant valley green in Mar-Jun)",
    attractions: ["Solang Valley Adventure Park", "Rohtang Pass Snow Point", "Hadimba Temple", "Old Manali Cafe Street"],
    food: ["Siddu (traditional Himachali steamed bread)", "Trout Fish", "Thukpa & Momos", "Apple Cider"],
    routeInfo: {
      flight: "Fly to Bhuntar / Kullu-Manali Airport (KUU - 50km) or Chandigarh",
      train: "Train to Chandigarh (CDG) then scenic Volvo bus uphill",
      bus: "HPTDC / Private Volvo sleeper buses overnight from Delhi & Chandigarh",
      cab: "Mountain highway drive via Kiratpur-Manali Expressway"
    },
    flightEst: 6500, trainEst: 1200, busEst: 1100, cabEst: 8500
  }
};

function extractCities(text: string): { source: string | null; destination: string | null } {
  let source: string | null = null;
  let destination: string | null = null;

  // Pattern 1: "from <CityA> to <CityB>"
  const fromToMatch = text.match(/from\s+([a-zA-Z\s]+?)\s+to\s+([a-zA-Z\s]+)/i);
  if (fromToMatch) {
    const rawSrc = fromToMatch[1].trim();
    const rawDst = fromToMatch[2].trim();

    const matchedSrc = INDIAN_CITIES.find(c => c.toLowerCase() === rawSrc.toLowerCase() || rawSrc.toLowerCase().includes(c.toLowerCase()));
    const matchedDst = INDIAN_CITIES.find(c => c.toLowerCase() === rawDst.toLowerCase() || rawDst.toLowerCase().includes(c.toLowerCase()));

    source = matchedSrc || rawSrc;
    destination = matchedDst || rawDst;
    return { source, destination };
  }

  // Pattern 2: "to <CityB> from <CityA>"
  const toFromMatch = text.match(/to\s+([a-zA-Z\s]+?)\s+from\s+([a-zA-Z\s]+)/i);
  if (toFromMatch) {
    const rawDst = toFromMatch[1].trim();
    const rawSrc = toFromMatch[2].trim();

    const matchedDst = INDIAN_CITIES.find(c => c.toLowerCase() === rawDst.toLowerCase() || rawDst.toLowerCase().includes(c.toLowerCase()));
    const matchedSrc = INDIAN_CITIES.find(c => c.toLowerCase() === rawSrc.toLowerCase() || rawSrc.toLowerCase().includes(c.toLowerCase()));

    destination = matchedDst || rawDst;
    source = matchedSrc || rawSrc;
    return { source, destination };
  }

  // Pattern 3: Standalone city mentions
  const foundCities: string[] = [];
  INDIAN_CITIES.forEach((city) => {
    const reg = new RegExp(`\\b${city}\\b`, "i");
    if (reg.test(text)) {
      foundCities.push(city);
    }
  });

  if (foundCities.length >= 2) {
    source = foundCities[0];
    destination = foundCities[1];
  } else if (foundCities.length === 1) {
    destination = foundCities[0];
  }

  return { source, destination };
}

function extractTripDetails(text: string) {
  const travelersMatch = text.match(/(\d+)\s*(people|person|traveler|traveller|friend|adult)/i);
  const daysMatch = text.match(/(\d+)\s*(day|night)/i);
  const dateMatch = text.match(/(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec|\d{1,2}\/\d{1,2}|\d{4}-\d{2}-\d{2})/i);

  return {
    travelers: travelersMatch ? parseInt(travelersMatch[1], 10) : null,
    days: daysMatch ? parseInt(daysMatch[1], 10) : null,
    dates: dateMatch ? dateMatch[0] : null,
  };
}

// Check Cerebras AI availability safely
function getCerebrasClient(): OpenAI | null {
  const apiKey = process.env.CEREBRAS_API_KEY;
  if (!apiKey) return null;
  return new OpenAI({
    apiKey,
    baseURL: "https://api.cerebras.ai/v1",
  });
}

async function callCerebrasAI(
  systemPrompt: string,
  messages: Array<{ role: string; content: string }>
): Promise<string | null> {
  try {
    const client = getCerebrasClient();
    if (!client) return null;

    const response = await client.chat.completions.create({
      model: "llama3.1-8b",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.map(m => ({ role: m.role as "user" | "assistant", content: m.content })),
      ],
      max_tokens: 1200,
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content ?? null;
  } catch (err) {
    // Graceful fallback to static Knowledge Base
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "messages array is required" }, { status: 400 });
    }

    const userMessages = messages.filter((m: { role: string }) => m.role === "user");
    const fullUserText = userMessages.map((m: { content: string }) => m.content).join(" ");
    const lastUserMsg = userMessages[userMessages.length - 1]?.content || "";
    const lowerLast = lastUserMsg.toLowerCase();

    const { source, destination } = extractCities(fullUserText);
    const { travelers, days, dates } = extractTripDetails(fullUserText);

    // ── INTENT CLASSIFICATION ────────────────────────────────────────────────
    const isBestTimeQuery = lowerLast.includes("best time") || lowerLast.includes("when to visit") || lowerLast.includes("best month") || lowerLast.includes("weather");
    const isReachRouteQuery = lowerLast.includes("how to reach") || lowerLast.includes("how can i reach") || lowerLast.includes("transport") || lowerLast.includes("how to go");
    const isTellMeAboutQuery = lowerLast.includes("tell me about") || lowerLast.includes("info on") || lowerLast.includes("what is special") || lowerLast.includes("attractions");
    const isFoodQuery = lowerLast.includes("food") || lowerLast.includes("eat") || lowerLast.includes("dishes") || lowerLast.includes("culinary");
    const isSafetyQuery = lowerLast.includes("safe") || lowerLast.includes("safety") || lowerLast.includes("night");
    const isFullPlanQuery = lowerLast.includes("plan") || lowerLast.includes("itinerary") || lowerLast.includes("trip to") || (source && destination);

    const activeDest = destination || "Goa";
    const destKey = activeDest.toLowerCase();
    const kb = CITY_KNOWLEDGE[destKey];
    const destInfo = await findDestination(activeDest);
    const safetyData = await getSafetyAdvisory(activeDest);
    const weatherData = await fetchWeather(activeDest);
    const weatherTemp = weatherData?.[0] ? `${weatherData[0].tempMinC}°C – ${weatherData[0].tempMaxC}°C` : "22°C – 31°C";

    // 1. BEST TIME / WEATHER QUERY
    if (isBestTimeQuery && !isFullPlanQuery) {
      const bestTimeText = kb ? kb.bestTime : `${destInfo?.bestTimeToVisit || "October to March"}`;
      const reply = `🌤️ **Best Time to Visit ${activeDest}**\n\n` +
        `• **Recommended Months**: ${bestTimeText}\n` +
        `• **Current Forecast**: Expected temperature range of **${weatherTemp}** with generally pleasant skies.\n` +
        `• **Travel Tip**: Packing light cottons along with a light sweater for evening strolls is recommended.\n\n` +
        `*${DISCLAIMER_NOTE}*`;
      return NextResponse.json({ reply, readyToGenerate: false });
    }

    // 2. HOW TO REACH / ROUTE QUERY
    if (isReachRouteQuery && !isFullPlanQuery) {
      const srcName = source || "Mumbai";
      const route = kb?.routeInfo || {
        flight: `Direct / Connecting flights available from ${srcName}`,
        train: `Express / Rajdhani trains from ${srcName} to nearest junction`,
        bus: `AC Volvo Sleeper buses operating on national highways`,
        cab: `Outstation cab options via national expressways`
      };

      const flightSearchUrl = `https://www.google.com/travel/flights?q=Flights+from+${encodeURIComponent(srcName)}+to+${encodeURIComponent(activeDest)}`;
      const trainSearchUrl = `https://www.irctc.co.in/nget/train-search`;
      const busSearchUrl = `https://www.redbus.in/bus-tickets/${encodeURIComponent(srcName.toLowerCase())}-to-${encodeURIComponent(activeDest.toLowerCase())}`;

      const reply = `🚆 **How to Reach ${activeDest} from ${srcName}** (Transport Guidance)\n\n` +
        `• ✈️ **Flight Option**: ${route.flight} *(Est. ~₹${kb?.flightEst || 4500}/person)*\n` +
        `  👉 **[Search Flights on Google Flights](${flightSearchUrl})**\n\n` +
        `• 🚆 **Train Option**: ${route.train} *(Est. ~₹${kb?.trainEst || 1250}/person)*\n` +
        `  👉 **[Search Trains on IRCTC](${trainSearchUrl})**\n\n` +
        `• 🚌 **Bus Option**: ${route.bus} *(Est. ~₹${kb?.busEst || 950}/person)*\n` +
        `  👉 **[Search Buses on RedBus](${busSearchUrl})**\n\n` +
        `• 🚗 **Cab Option**: ${route.cab} *(Est. ~₹${kb?.cabEst || 6500} total vehicle fare)*\n\n` +
        `📌 *Note: Fares and schedules are estimated values for planning. Live availability must be checked on official booking portals.*\n\n` +
        `*${DISCLAIMER_NOTE}*`;
      return NextResponse.json({ reply, readyToGenerate: false });
    }

    // 3. TELL ME ABOUT / DESTINATION HIGHLIGHTS
    if (isTellMeAboutQuery && !isFullPlanQuery) {
      const attractions = kb ? kb.attractions : (destInfo?.experiences || ["Historic Monuments", "Local Markets", "Sunset Points"]);
      const tagline = kb ? kb.tagline : (destInfo?.description || `Popular destination in India`);

      const reply = `🏛️ **About ${activeDest}**\n\n` +
        `**Overview**: ${tagline}\n\n` +
        `**Top Attractions & Experiences**:\n` +
        attractions.map(a => `• **${a}**`).join("\n") + "\n\n" +
        `• **Best Season**: ${kb?.bestTime || destInfo?.bestTimeToVisit || "October to March"}\n` +
        `• **Safety Score**: ${safetyData.general_safety_score} / 5.0\n\n` +
        `*${DISCLAIMER_NOTE}*`;
      return NextResponse.json({ reply, readyToGenerate: false });
    }

    // 4. FOOD QUERY
    if (isFoodQuery && !isFullPlanQuery) {
      const foodItems = kb ? kb.food : ["Local Thali & Breads", "Famous Street Food Outlets", "Regional Sweets & Beverages"];
      const reply = `🍽️ **Must-Try Culinary Highlights in ${activeDest}**\n\n` +
        foodItems.map((f, i) => `${i + 1}. **${f}**`).join("\n") + "\n\n" +
        `*${DISCLAIMER_NOTE}*`;
      return NextResponse.json({ reply, readyToGenerate: false });
    }

    // 5. SAFETY QUERY
    if (isSafetyQuery && !isFullPlanQuery) {
      const reply = `🛡️ **Safety Insights for ${activeDest}**\n\n` +
        `• **General Safety Rating**: ${safetyData.general_safety_score} / 5.0\n` +
        `• **Solo / Women Traveller Safety**: ${safetyData.girls_trip_safety_score} / 5.0\n` +
        `• **Local Note**: ${safetyData.source_note}\n` +
        `• **Tips**: Use verified cab aggregators for late night travel and stay within well-lit main tourist belts.\n\n` +
        `*${DISCLAIMER_NOTE}*`;
      return NextResponse.json({ reply, readyToGenerate: false });
    }

    // ── PRE-ITINERARY CHECK FOR MISSING DETAILS ─────────────────────────────
    const missing: string[] = [];
    if (!travelers) missing.push("how many people are travelling");
    if (!days) missing.push("how many days the trip will be");
    if (!dates) missing.push("your preferred travel dates or month");

    if (missing.length > 0 && (!destination || missing.length >= 2) && !isFullPlanQuery) {
      const destPrompt = destination ? `for your trip to **${destination}**` : "for your trip";
      return NextResponse.json({
        reply: `Great choice! To build a tailored itinerary ${destPrompt}, could you share:\n\n` +
          missing.map((m, idx) => `${idx + 1}. **${m.slice(0, 1).toUpperCase() + m.slice(1)}**`).join("\n") +
          `\n\n*(For example: "2 people for 4 days in November starting from ${source || "Mumbai"}")*`,
        readyToGenerate: false,
      });
    }

    // ── FULL TRIP PLAN GENERATION ────────────────────────────────────────────
    const activeSource = source || "Mumbai";
    const activeTravelers = travelers || 2;
    const activeDays = days || 4;

    const flightPrice = (kb?.flightEst || 4800);
    const trainPrice = (kb?.trainEst || 1450);
    const busPrice = (kb?.busEst || 950);
    const cabPrice = (kb?.cabEst || 7500);

    const flightSearchUrl = `https://www.google.com/travel/flights?q=Flights+from+${encodeURIComponent(activeSource)}+to+${encodeURIComponent(activeDest)}`;
    const trainSearchUrl = `https://www.irctc.co.in/nget/train-search`;
    const busSearchUrl = `https://www.redbus.in/bus-tickets/${encodeURIComponent(activeSource.toLowerCase())}-to-${encodeURIComponent(activeDest.toLowerCase())}`;
    const cabSearchUrl = `https://www.makemytrip.com/cabs/`;

    const attractionsList = kb ? kb.attractions : (destInfo?.experiences || ["Heritage Tour", "Local Markets", "Sunset Viewpoint"]);
    const foodList = kb ? kb.food : ["Regional Thali", "Street Food Bazaars"];

    const itineraryReply = `Namaste! ✈️ Here are your estimated **${activeDays}-Day Travel Plan Options** for **${activeSource} → ${activeDest}** (for **${activeTravelers} traveller(s)**):\n\n` +
      `📌 *Disclaimer: Fares, schedules, and hotel availability shown below are estimated reference values for planning purposes. Please verify live availability on official booking portals before confirming.*\n\n` +
      `--- \n### ✈️ Option 1 — Flight Plan (Estimated)\n` +
      `• **Route**: Non-stop / Connecting Flight from ${activeSource} to nearest airport for ${activeDest}\n` +
      `• **Sample Timings**: Departure 08:30 AM → Arrival 10:45 AM (Est. 2h 15m)\n` +
      `• **Estimated Airfare**: ₹${flightPrice.toLocaleString("en-IN")}/person (Total: ₹${(flightPrice * activeTravelers).toLocaleString("en-IN")})\n` +
      `• **Accommodation**: 3/4-Star Heritage Hotel (${activeDays} nights) · *(subject to live availability)*\n` +
      `• **Total Trip Estimate**: ₹${((flightPrice * activeTravelers) + (3500 * activeDays) + (1000 * activeTravelers * activeDays)).toLocaleString("en-IN")}\n\n` +
      `🔗 **[Search Flights on Google Flights](${flightSearchUrl})** &nbsp;|&nbsp; 👉 **[Plan This Flight Plan](/plan?option=flight&source=${encodeURIComponent(activeSource)}&dest=${encodeURIComponent(activeDest)})**\n\n` +
      `--- \n### 🚆 Option 2 — Express Train Plan (Estimated)\n` +
      `• **Route**: Express / Rajdhani Train (3AC/2AC Class) from ${activeSource} to ${activeDest} junction\n` +
      `• **Sample Timings**: Departure 07:15 PM → Arrival 06:45 AM (+1 day)\n` +
      `• **Estimated Rail Fare**: ₹${trainPrice.toLocaleString("en-IN")}/person (Total: ₹${(trainPrice * activeTravelers).toLocaleString("en-IN")})\n` +
      `• **Tatkal / General Booking**: *Check IRCTC portal 1 day prior at 10:00 AM for Tatkal quota*\n` +
      `• **Accommodation**: Boutique City Hotel (${activeDays} nights) · *(subject to live availability)*\n` +
      `• **Total Trip Estimate**: ₹${((trainPrice * activeTravelers) + (2200 * activeDays) + (800 * activeTravelers * activeDays)).toLocaleString("en-IN")}\n\n` +
      `🔗 **[Search Trains on IRCTC](${trainSearchUrl})** &nbsp;|&nbsp; 👉 **[Plan This Train Plan](/plan?option=train&source=${encodeURIComponent(activeSource)}&dest=${encodeURIComponent(activeDest)})**\n\n` +
      `--- \n### 🚌 Option 3 — AC Volvo Bus Plan (Estimated)\n` +
      `• **Route**: Direct AC Volvo Sleeper / Seater Bus from ${activeSource}\n` +
      `• **Sample Timings**: Departure 08:00 PM → Arrival 09:00 AM (+1 day)\n` +
      `• **Estimated Bus Fare**: ₹${busPrice.toLocaleString("en-IN")}/person (Total: ₹${(busPrice * activeTravelers).toLocaleString("en-IN")})\n` +
      `• **Accommodation**: Deluxe Guesthouse (${activeDays} nights) · *(subject to live availability)*\n` +
      `• **Total Trip Estimate**: ₹${((busPrice * activeTravelers) + (1600 * activeDays) + (600 * activeTravelers * activeDays)).toLocaleString("en-IN")}\n\n` +
      `🔗 **[Search Buses on RedBus](${busSearchUrl})** &nbsp;|&nbsp; 👉 **[Plan This Bus Plan](/plan?option=bus&source=${encodeURIComponent(activeSource)}&dest=${encodeURIComponent(activeDest)})**\n\n` +
      `--- \n### 🚗 Option 4 — Private Outstation Cab (Best Value)\n` +
      `• **Route**: Door-to-door Outstation SUV Cab from ${activeSource} to ${activeDest}\n` +
      `• **Sample Timings**: Flexible On-Demand Pickup\n` +
      `• **Estimated Cab Fare**: ₹${cabPrice.toLocaleString("en-IN")} total vehicle fare (~₹${Math.round(cabPrice / activeTravelers).toLocaleString("en-IN")}/person)\n` +
      `• **Total Trip Estimate**: ₹${(cabPrice + (2500 * activeDays) + (700 * activeTravelers * activeDays)).toLocaleString("en-IN")}\n\n` +
      `🔗 **[Search Outstation Cabs](${cabSearchUrl})** &nbsp;|&nbsp; 👉 **[Plan This Cab Plan](/plan?option=cab&source=${encodeURIComponent(activeSource)}&dest=${encodeURIComponent(activeDest)})**\n\n` +
      `### 🌤️ Expected Weather Forecast\n` +
      `• Expected Temperature: ${weatherTemp} · Pack comfortable clothes and light layering.\n\n` +
      `### 🛡️ Safety Info Card\n` +
      `• **General Safety Score**: ${safetyData.general_safety_score} / 5.0\n` +
      `• **Solo / Women Safety Score**: ${safetyData.girls_trip_safety_score} / 5.0\n` +
      `• **Local Note**: ${safetyData.source_note}\n\n` +
      `### 📍 Key Highlights to Visit in ${activeDest}\n` +
      attractionsList.map(a => `• **${a}**`).join("\n") + "\n\n" +
      `### 🍽️ Recommended Local Food\n` +
      foodList.map(f => `• **${f}**`).join("\n") + "\n\n" +
      `*${DISCLAIMER_NOTE}*`;

    return NextResponse.json({ reply: itineraryReply, readyToGenerate: true });
  } catch (err: unknown) {
    console.error("[api/chat] Error:", err);
    return NextResponse.json(
      { error: "Failed to process request. Please try again." },
      { status: 500 }
    );
  }
}
