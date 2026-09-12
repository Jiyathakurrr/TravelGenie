/**
 * lib/cerebras.ts
 * Cerebras API client — OpenAI-SDK compatible.
 * Uses CEREBRAS_API_KEY from .env.local — never hardcoded.
 */
import OpenAI from "openai";

const apiKey = process.env.CEREBRAS_API_KEY;

if (!apiKey) {
  console.warn("[cerebras] CEREBRAS_API_KEY is not set in .env.local. AI features will fail.");
} else {
  console.log(`[cerebras] API key loaded: ${apiKey.slice(0, 8)}...`);
}

export const cerebras = new OpenAI({
  apiKey: apiKey ?? "missing-key",
  baseURL: "https://api.cerebras.ai/v1",
});

// Primary and fallback Cerebras models
export const CEREBRAS_CHAT_MODEL = process.env.CEREBRAS_MODEL || "llama-3.3-70b";
export const FALLBACK_CEREBRAS_MODEL = "llama3.1-8b";
