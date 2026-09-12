/**
 * lib/kie.ts
 * Kie API Client — supporting conversational chat & structured JSON itinerary generation.
 * Uses KIE_API_KEY from environment.
 */
import OpenAI from "openai";

const apiKey = process.env.KIE_API_KEY || "3354583866400447c5d2412922538cff";

if (!apiKey) {
  console.warn("[kie] KIE_API_KEY is missing. Using fallback endpoint configuration.");
} else {
  console.log(`[kie] API key loaded: ${apiKey.slice(0, 8)}...`);
}

export const kieClient = new OpenAI({
  apiKey: apiKey,
  baseURL: "https://api.kie.ai/v1",
});

export const KIE_DEFAULT_MODEL = process.env.KIE_MODEL || "deepseek-chat";
