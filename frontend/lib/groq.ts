/**
 * lib/groq.ts
 * GroqCloud API client — OpenAI-SDK compatible.
 * Uses GROQ_API_KEY from .env.local — server-side only, never exposed to frontend.
 */
import OpenAI from "openai";

const apiKey = process.env.GROQ_API_KEY;

if (!apiKey) {
  console.warn("[groq] GROQ_API_KEY is not set in .env.local.");
}

export function getGroqClient(): OpenAI | null {
  const key = process.env.GROQ_API_KEY;
  if (!key) return null;
  return new OpenAI({
    apiKey: key,
    baseURL: "https://api.groq.com/openai/v1",
  });
}

// User-specified primary model: openai/gpt-oss-120b
export const GROQ_PRIMARY_MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";
export const GROQ_FALLBACK_MODEL = "llama-3.3-70b-versatile";
