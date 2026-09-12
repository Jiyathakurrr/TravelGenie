/**
 * app/api/chat/route.ts
 *
 * Travel Genie AI Chatbot Endpoint — powered by Cerebras Llama (OpenAI-compatible API)
 * - Source/Destination entity extraction (e.g. "from Mumbai to Agra")
 * - Pre-itinerary missing questions check (People, Days, Dates/Month)
 * - Dynamic AI responses via Cerebras for context-specific answers
 * - 3-4 Transport Options with "Plan This" buttons
 * - Booking window (60-120 days) & Emergency Booking Logic:
 *   - Train: "Tatkal Emergency Booking"
 *   - Flight: "Spot Fare / Emergency Flight Booking"
 *   - Bus: NO emergency booking option
 * - Safety Card with required disclaimer
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

function extractCities(text: string): { source: string | null; destination: string | null } {
  let source: string | null = null;
  let destination: string | null = null;

  // Pattern 1: "from <CityA> to <CityB>" or "from <CityA> heading to <CityB>"
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

// Initialize Cerebras client (OpenAI-compatible)
function getCerebrasClient(): OpenAI | null {
  const apiKey = process.env.CEREBRAS_API_KEY;
  if (!apiKey) {
    console.warn("[chat] CEREBRAS_API_KEY not set");
    return null;
  }
  return new OpenAI({
    apiKey,
    baseURL: "https://api.cerebras.ai/v1",
  });
}

async function callCerebrasAI(
  systemPrompt: string,
  messages: Array<{ role: string; content: string }>,
  contextNote: string
): Promise<string | null> {
  try {
    const client = getCerebrasClient();
    if (!client) return null;

    const response = await client.chat.completions.create({
      model: "gpt-oss-120b",  // Available Cerebras models: gpt-oss-120b, gemma-4-31b, qwen-3.8-27b
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.map(m => ({ role: m.role as "user" | "assistant", content: m.content })),
      ],
      max_tokens: 1500,
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content ?? null;
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error("[chat] Cerebras API error:", errMsg);
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

    // Combine all user messages to accumulate context
    const userMessages = messages.filter((m: { role: string }) => m.role === "user");
    const fullUserText = userMessages.map((m: { content: string }) => m.content).join(" ");
    const lastUserMsg = userMessages[userMessages.length - 1]?.content || "";

    const { source, destination } = extractCities(fullUserText);
    const { travelers, days, dates } = extractTripDetails(fullUserText);

    // ── Ambiguous destination guard ──────────────────────────────────────────
    if (!destination && (lastUserMsg.includes("visit there") || lastUserMsg.includes("take me somewhere"))) {
      return NextResponse.json({
        reply: "I'd love to help you plan! 🌟 Which city or region in India would you like to visit? (e.g. Goa, Agra, Jaipur, Manali, Kerala, Udaipur)",
        readyToGenerate: false,
      });
    }

    // ── Pre-itinerary Key Questions Check ────────────────────────────────────
    const missing: string[] = [];
    if (!travelers) missing.push("how many people are travelling");
    if (!days) missing.push("how many days the trip will be");
    if (!dates) missing.push("your travel dates or target month");

    if (missing.length > 0 && (!destination || missing.length >= 2)) {
      const destPrompt = destination ? `for your trip to **${destination}**` : "for your trip";
      return NextResponse.json({
        reply: `Great choice! To build your perfect itinerary ${destPrompt}, could you share:\n\n` +
          missing.map((m, idx) => `${idx + 1}. **${m.slice(0, 1).toUpperCase() + m.slice(1)}**`).join("\n") +
          `\n\n*(For example: "3 people for 4 days in October from ${source || "Mumbai"}")*`,
        readyToGenerate: false,
      });
    }

    const activeDest = destination || "Goa";
    const activeSource = source || "Delhi";
    const activeTravelers = travelers || 2;
    const activeDays = days || 4;

    const destInfo = await findDestination(activeDest);
    const safetyData = await getSafetyAdvisory(activeDest);
    const weatherData = await fetchWeather(activeDest);

    const weatherTemp = weatherData?.[0] ? `${weatherData[0].tempMinC}°C – ${weatherData[0].tempMaxC}°C` : "22°C – 31°C";

    // ── Check for Follow-up Questions — use Cerebras AI for dynamic responses ──
    const lowerLast = lastUserMsg.toLowerCase();
    const isFollowUp =
      lowerLast.includes("safe at night") ||
      lowerLast.includes("night safety") ||
      lowerLast.includes("shorten") ||
      lowerLast.includes("shorter") ||
      lowerLast.includes("food") ||
      lowerLast.includes("dishes") ||
      lowerLast.includes("eat") ||
      lowerLast.includes("best month") ||
      lowerLast.includes("photography") ||
      lowerLast.includes("local transport") ||
      lowerLast.includes("budget tip") ||
      lowerLast.includes("what to pack") ||
      lowerLast.includes("activities") ||
      lowerLast.includes("places to visit") ||
      lowerLast.includes("hotels") ||
      lowerLast.includes("accommodation");

    if (isFollowUp) {
      // Build contextual system prompt for follow-up
      const contextSystemPrompt = `${CHAT_SYSTEM_PROMPT}

## CURRENT TRIP CONTEXT
- Source City: ${activeSource}
- Destination: ${activeDest}
- Travellers: ${activeTravelers}
- Days: ${activeDays}
- General Safety Score: ${safetyData.general_safety_score}/5.0
- Girls' Trip Safety Score: ${safetyData.girls_trip_safety_score}/5.0
- Safety Note: ${safetyData.source_note}
- Weather: ${weatherTemp}
- Top Experiences: ${(destInfo?.experiences || []).join(", ")}

Provide a precise, context-specific response for ${activeDest}. Be concrete and accurate — not generic.
Always end with: *${DISCLAIMER_NOTE}*`;

      const aiReply = await callCerebrasAI(contextSystemPrompt, messages, activeDest);

      if (aiReply) {
        return NextResponse.json({ reply: aiReply, readyToGenerate: false });
      }

      // Fallback if Cerebras fails
      if (lowerLast.includes("safe at night") || lowerLast.includes("night safety")) {
        return NextResponse.json({
          reply: `🛡️ **Night Safety in ${destInfo?.name || activeDest}**:\n\n` +
            `• **General Safety Score**: ${safetyData.general_safety_score}/5.0\n` +
            `• **Girls' Trip Safety Score**: ${safetyData.girls_trip_safety_score}/5.0\n\n` +
            `**Guidance**: ${destInfo?.safety_note || "Main tourist belts are well-policed and active until late evening."}\n` +
            `• Use verified cabs (Uber/Ola/hotel cabs) for night travel.\n` +
            `• Stick to well-lit tourist avenues and popular market streets.\n\n` +
            `*${DISCLAIMER_NOTE}*`,
          readyToGenerate: false,
        });
      }
    }

    // ── Try full dynamic itinerary via Cerebras ────────────────────────────────
    const itinerarySystemPrompt = `${CHAT_SYSTEM_PROMPT}

## CONTEXT DATA (use this for accurate responses)
- Route: ${activeSource} → ${activeDest}
- Travellers: ${activeTravelers} people
- Duration: ${activeDays} days
- Travel Dates/Month: ${dates || "not specified"}
- Expected Weather: ${weatherTemp}
- General Safety Score: ${safetyData.general_safety_score}/5.0
- Girls' Trip Safety Score: ${safetyData.girls_trip_safety_score}/5.0
- Safety Note: ${safetyData.source_note}
- Top Experiences at ${activeDest}: ${(destInfo?.experiences || ["Heritage Tour", "Local Markets", "Sunset Point"]).join(", ")}

## REQUIRED FORMAT
Generate the full itinerary with all 4 transport options (Flight, Train, Bus, Private Cab).
Include realistic Indian pricing in INR.
Always include the booking window note (60-120 days in advance).
For trains: mention IRCTC Tatkal emergency option.
For flights: mention Spot Fare emergency option.
For buses: NO emergency booking option.
Include weather forecast, safety card, and top food/places sections.
Always end with: *${DISCLAIMER_NOTE}*`;

    const aiItinerary = await callCerebrasAI(itinerarySystemPrompt, messages, activeDest);

    if (aiItinerary) {
      return NextResponse.json({ reply: aiItinerary, readyToGenerate: true });
    }

    // ── Fallback: Structured template when Cerebras unavailable ──────────────
    const flightCostPerson = 4800;
    const trainCostPerson = 1450;
    const busCostPerson = 950;
    const cabTotalCost = 7500;

    const itineraryReply = `Namaste! ✈️ Here are your **${activeDays}-Day Itinerary Options** for **${activeSource} → ${activeDest}** (for **${activeTravelers} travellers**):\n\n` +
      `📌 *Booking Window Notice: Regular tickets can typically be booked up to 60–120 days (1–2 months) in advance.*\n\n` +
      `--- \n### ✈️ Option 1 — Flight Option\n` +
      `• **Route**: Non-stop flight from ${activeSource} to nearest airport for ${activeDest} (2h 15m)\n` +
      `• **Timings**: Departure 08:30 AM → Arrival 10:45 AM\n` +
      `• **Regular Fare**: ₹${flightCostPerson.toLocaleString("en-IN")}/person (Total: ₹${(flightCostPerson * activeTravelers).toLocaleString("en-IN")})\n` +
      `• **Emergency Last-Minute Fare**: *Spot Fare / Emergency Airline Desk Booking* available (premium pricing applies for same-day departure)\n` +
      `• **Accommodation**: Heritage Resort / 4-Star Hotel (${activeDays} nights) · *(estimated availability)*\n` +
      `• **Total Trip Estimate**: ₹${((flightCostPerson * activeTravelers) + (3500 * activeDays) + (1000 * activeTravelers * activeDays)).toLocaleString("en-IN")}\n\n` +
      `👉 **[Plan This Option — Select Flight Plan](/plan?option=flight&dest=${encodeURIComponent(activeDest)})**\n\n` +
      `--- \n### 🚆 Option 2 — Train Option\n` +
      `• **Route**: Express Train (3AC Class) from ${activeSource} to ${activeDest} junction\n` +
      `• **Timings**: Departure 07:15 PM → Arrival 06:45 AM (+1 day)\n` +
      `• **Regular Fare**: ₹${trainCostPerson.toLocaleString("en-IN")}/person (Total: ₹${(trainCostPerson * activeTravelers).toLocaleString("en-IN")})\n` +
      `• **Emergency Last-Minute Booking**: ⚡ **IRCTC Tatkal Quota Available** (Opens 1 day prior at 10:00 AM for AC / 11:00 AM for Sleeper)\n` +
      `• **Accommodation**: Boutique City Hotel (${activeDays} nights) · *(estimated availability)*\n` +
      `• **Total Trip Estimate**: ₹${((trainCostPerson * activeTravelers) + (2200 * activeDays) + (800 * activeTravelers * activeDays)).toLocaleString("en-IN")}\n\n` +
      `👉 **[Plan This Option — Select Train Plan](/plan?option=train&dest=${encodeURIComponent(activeDest)})**\n\n` +
      `--- \n### 🚌 Option 3 — AC Volvo Bus Option\n` +
      `• **Route**: Direct AC Volvo Sleeper Bus from ${activeSource}\n` +
      `• **Timings**: Departure 08:00 PM → Arrival 09:00 AM (+1 day)\n` +
      `• **Fare**: ₹${busCostPerson.toLocaleString("en-IN")}/person (Total: ₹${(busCostPerson * activeTravelers).toLocaleString("en-IN")})\n` +
      `• *(Note: Buses run on standard seating without emergency Tatkal/Spot quotas)*\n` +
      `• **Accommodation**: Deluxe Guesthouse (${activeDays} nights) · *(estimated availability)*\n` +
      `• **Total Trip Estimate**: ₹${((busCostPerson * activeTravelers) + (1600 * activeDays) + (600 * activeTravelers * activeDays)).toLocaleString("en-IN")}\n\n` +
      `👉 **[Plan This Option — Select Bus Plan](/plan?option=bus&dest=${encodeURIComponent(activeDest)})**\n\n` +
      `--- \n### 🚗 Option 4 — Private Outstation Cab (Best Value)\n` +
      `• **Route**: Door-to-door Private SUV Cab from ${activeSource} to ${activeDest}\n` +
      `• **Timings**: Flexible On-Demand Pickup\n` +
      `• **Fare**: ₹${cabTotalCost.toLocaleString("en-IN")} total for vehicle (~₹${Math.round(cabTotalCost / activeTravelers).toLocaleString("en-IN")}/person)\n` +
      `• **Total Trip Estimate**: ₹${(cabTotalCost + (2500 * activeDays) + (700 * activeTravelers * activeDays)).toLocaleString("en-IN")}\n\n` +
      `👉 **[Plan This Option — Select Cab Plan](/plan?option=cab&dest=${encodeURIComponent(activeDest)})**\n\n` +
      `### 🌤️ Weather Forecast\n` +
      `• Expected Range: ${weatherTemp} · Clear/Partly Cloudy skies · Pack comfortable cottons & light layer.\n\n` +
      `### 🛡️ Safety Info Card\n` +
      `• **General Safety Score**: ${safetyData.general_safety_score} / 5.0\n` +
      `• **Girls' Trip Safety Score**: ${safetyData.girls_trip_safety_score} / 5.0\n` +
      `• **Note**: ${safetyData.source_note}\n` +
      `*${DISCLAIMER_NOTE}*\n\n` +
      `### 📍 Top Highlights\n` +
      `${(destInfo?.experiences || ["Heritage Tour", "Local Markets", "Sunset Point"]).map(e => `• **${e}**: Top-rated experience`).join("\n")}`;

    return NextResponse.json({ reply: itineraryReply, readyToGenerate: true });
  } catch (err: unknown) {
    console.error("[api/chat] Error:", err);
    return NextResponse.json(
      { error: "Failed to process request. Please try again." },
      { status: 500 }
    );
  }
}
