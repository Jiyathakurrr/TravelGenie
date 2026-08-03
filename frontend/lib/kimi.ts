/**
 * lib/kimi.ts
 * Kimi API client (Moonshot AI) — OpenAI-SDK compatible.
 *
 * Kimi's API is fully compatible with the OpenAI SDK.
 * We configure it with a custom baseURL and our KIMI_API_KEY.
 *
 * TODO: confirm model string with Moonshot docs before production use.
 *       At time of writing, "moonshot-v1-8k" and "moonshot-v1-32k" are known IDs.
 *       "moonshot-v1-128k" supports very long context (full itinerary conversations).
 */
import OpenAI from "openai";

if (!process.env.KIMI_API_KEY) {
  // Allow dev without key — will fail at runtime if a call is actually made.
  console.warn(
    "[kimi] KIMI_API_KEY not set. AI features will fail at runtime."
  );
}

export const kimi = new OpenAI({
  apiKey: process.env.KIMI_API_KEY ?? "missing-key",
  baseURL: "https://api.moonshot.cn/v1", // Kimi OpenAI-compatible endpoint
});

// TODO: confirm model string — swap to the correct model once confirmed with Moonshot docs.
export const KIMI_CHAT_MODEL = "moonshot-v1-8k";
export const KIMI_ITINERARY_MODEL = "moonshot-v1-32k"; // longer context for structured output
