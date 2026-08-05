/**
 * lib/weather.ts
 * Integration with Open-Meteo free/keyless weather API.
 */

import type { WeatherDay } from "@/types/chat";

// Hardcoded coordinates lookup for common Indian travel destinations
const DESTINATION_COORDS: Record<string, { lat: number; lon: number }> = {
  goa: { lat: 15.4909, lon: 73.8278 },
  manali: { lat: 32.2432, lon: 77.1892 },
  kerala: { lat: 9.9312, lon: 76.2673 },
  kochi: { lat: 9.9312, lon: 76.2673 },
  jaipur: { lat: 26.9124, lon: 75.7873 },
  udaipur: { lat: 24.5854, lon: 73.7125 },
  rishikesh: { lat: 30.0869, lon: 78.2676 },
  mumbai: { lat: 19.076, lon: 72.8777 },
  delhi: { lat: 28.6139, lon: 77.209 },
  bangalore: { lat: 12.9716, lon: 77.5946 },
};

export async function fetchWeather(
  destination: string,
  startDate?: string,
  endDate?: string
): Promise<WeatherDay[] | null> {
  const normalized = destination.toLowerCase().trim();
  const coords = DESTINATION_COORDS[normalized] ?? DESTINATION_COORDS["goa"];

  try {
    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.searchParams.append("latitude", coords.lat.toString());
    url.searchParams.append("longitude", coords.lon.toString());
    url.searchParams.append("daily", "temperature_2m_max,temperature_2m_min,precipitation_sum");
    url.searchParams.append("timezone", "Asia/Kolkata");

    if (startDate && endDate) {
      url.searchParams.append("start_date", startDate);
      url.searchParams.append("end_date", endDate);
    }

    const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
    if (!res.ok) return null;

    const data = await res.json();
    const daily = data.daily;
    if (!daily || !daily.time) return null;

    return daily.time.map((timeStr: string, idx: number) => ({
      date: timeStr,
      tempMaxC: daily.temperature_2m_max[idx] ?? 30,
      tempMinC: daily.temperature_2m_min[idx] ?? 20,
      precipitationMm: daily.precipitation_sum[idx] ?? 0,
    }));
  } catch (err) {
    console.error("[weather] Open-Meteo API error:", err);
    return null;
  }
}
