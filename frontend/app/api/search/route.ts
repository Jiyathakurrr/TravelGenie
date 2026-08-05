import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import type { FlightOption, HotelOption, TrainOption, SearchResponse } from "@/types/chat";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { from, to, checkIn, checkOut, travelers = 1, budgetINR = 50000 } = body;

    const dataDir = path.join(process.cwd(), "data");

    // Load mock JSON data
    const flightsRaw = fs.readFileSync(path.join(dataDir, "flights.json"), "utf-8");
    const hotelsRaw = fs.readFileSync(path.join(dataDir, "hotels.json"), "utf-8");
    const trainsRaw = fs.readFileSync(path.join(dataDir, "trains.json"), "utf-8");

    const allFlights: FlightOption[] = JSON.parse(flightsRaw);
    const allHotels: HotelOption[] = JSON.parse(hotelsRaw);
    const allTrains: TrainOption[] = JSON.parse(trainsRaw);

    // Filter matching flights
    const matchingFlights = allFlights.filter(
      (f) =>
        f.from.toLowerCase() === (from || "").toLowerCase() &&
        f.to.toLowerCase() === (to || "").toLowerCase()
    );

    // Filter matching hotels
    const matchingHotels = allHotels.filter(
      (h) => h.destination.toLowerCase() === (to || "").toLowerCase()
    );

    // Calculate nights
    let nights = 3;
    if (checkIn && checkOut) {
      const d1 = new Date(checkIn);
      const d2 = new Date(checkOut);
      const diffTime = Math.abs(d2.getTime() - d1.getTime());
      nights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    }

    // Find cheapest flight and hotel to check budget
    const cheapestFlightPrice = matchingFlights.length > 0
      ? Math.min(...matchingFlights.map((f) => f.priceINR))
      : 4000;
    const cheapestHotelPrice = matchingHotels.length > 0
      ? Math.min(...matchingHotels.map((h) => h.pricePerNightINR))
      : 2500;

    const estimatedTotal = (cheapestFlightPrice * 2 * travelers) + (cheapestHotelPrice * nights);
    const overBudget = estimatedTotal > budgetINR;

    // Filter train alternatives if over budget
    const trainAlternatives = overBudget
      ? allTrains.filter(
          (t) =>
            t.from.toLowerCase() === (from || "").toLowerCase() &&
            t.to.toLowerCase() === (to || "").toLowerCase()
        )
      : [];

    const response: SearchResponse = {
      flights: matchingFlights.length > 0 ? matchingFlights : allFlights.slice(0, 3),
      hotels: matchingHotels.length > 0 ? matchingHotels : allHotels.slice(0, 3),
      overBudget,
      budgetDiff: overBudget ? estimatedTotal - budgetINR : 0,
      trainAlternatives,
    };

    return NextResponse.json(response);
  } catch (err) {
    console.error("[api/search] Error:", err);
    return NextResponse.json({ error: "Failed to search flight/hotel options" }, { status: 500 });
  }
}
