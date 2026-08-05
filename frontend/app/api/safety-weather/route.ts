import { NextRequest, NextResponse } from "next/server";
import { fetchWeather } from "@/lib/weather";
import { fetchSafetyAdvisory } from "@/lib/safety";
import type { SafetyWeatherResponse } from "@/types/chat";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { destination = "Goa", startDate, endDate } = body;

    const warnings: string[] = [];

    // Parallel calls to keyless APIs
    const [safety, weather] = await Promise.all([
      fetchSafetyAdvisory("IN").catch((e) => {
        warnings.push("Safety advisory data unavailable");
        return null;
      }),
      fetchWeather(destination, startDate, endDate).catch((e) => {
        warnings.push("Weather forecast data unavailable");
        return null;
      }),
    ]);

    const response: SafetyWeatherResponse = {
      safety,
      weather,
      warnings,
    };

    return NextResponse.json(response);
  } catch (err) {
    console.error("[api/safety-weather] Error:", err);
    return NextResponse.json(
      { safety: null, weather: null, warnings: ["API service error"] },
      { status: 500 }
    );
  }
}
