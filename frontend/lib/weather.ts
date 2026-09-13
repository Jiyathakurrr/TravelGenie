/**
 * lib/weather.ts
 * Integration with Open-Meteo free/keyless weather API.
 */

import type { WeatherDay } from "@/types/chat";

// Hardcoded coordinates lookup for Indian travel destinations
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
  varanasi: { lat: 25.3176, lon: 82.9739 },
  amritsar: { lat: 31.634, lon: 74.8723 },
  mysore: { lat: 12.2958, lon: 76.6394 },
  hampi: { lat: 15.335, lon: 76.46 },
  ooty: { lat: 11.4102, lon: 76.695 },
  agra: { lat: 27.1767, lon: 78.0081 },
  shimla: { lat: 31.1048, lon: 77.1734 },
  coorg: { lat: 12.4244, lon: 75.7382 },
  pondicherry: { lat: 11.9416, lon: 79.8083 },
  darjeeling: { lat: 27.041, lon: 88.2663 },
  andaman: { lat: 11.6233, lon: 92.7264 },
  ladakh: { lat: 34.1526, lon: 77.5771 },
  munnar: { lat: 10.0889, lon: 77.0595 },
  kasol: { lat: 32.01, lon: 77.315 },
};

export async function fetchWeather(
  destination: string,
  startDate?: string,
  endDate?: string
): Promise<WeatherDay[] | null> {
  const normalized = destination.toLowerCase().trim();
  const coords = DESTINATION_COORDS[normalized] ?? DESTINATION_COORDS["mumbai"];

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
