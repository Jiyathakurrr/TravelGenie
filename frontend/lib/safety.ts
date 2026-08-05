/**
 * lib/safety.ts
 * Integration with Travel-Advisory.info free/keyless travel safety API.
 */

export interface SafetyData {
  score: number;
  message: string;
  source: string;
}

export async function fetchSafetyAdvisory(isoCode = "IN"): Promise<SafetyData | null> {
  try {
    const res = await fetch(`https://www.travel-advisory.info/api?country=${isoCode}`, {
      next: { revalidate: 86400 }, // cache 24h
    });
    if (!res.ok) return null;

    const data = await res.json();
    const countryData = data.data?.[isoCode.toUpperCase()];
    if (!countryData || !countryData.advisory) return null;

    return {
      score: countryData.advisory.score ?? 1.5,
      message: countryData.advisory.message ?? "Exercise normal safety precautions when traveling.",
      source: "Travel-Advisory.info",
    };
  } catch (err) {
    console.error("[safety] Travel-Advisory API error:", err);
    return null;
  }
}
