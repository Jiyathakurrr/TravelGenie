/**
 * app/api/itinerary/route.ts
 *
 * Itinerary generation endpoint using Kimi API (Moonshot AI).
 *
 * Strategy:
 * - Receives validated TripInputs from the frontend.
 * - Sends a structured prompt to Kimi requesting strict JSON output.
 * - Parses, validates shape, and attaches a generated ID + timestamp.
 * - Returns the complete Itinerary object.
 *
 * NOTE: This uses moonshot-v1-32k for longer context.
 * If response time approaches 55s on Vercel Hobby, consider:
 *   1. Switching to moonshot-v1-8k (shorter output).
 *   2. Streaming the JSON progressively (Phase 2 enhancement).
 *
 * MOCK NOTE (Phase 1): Flight/hotel cost data is NOT integrated here yet.
 * The itinerary estimatedCostINR is calculated from the AI's activity estimates only.
 * In Phase 2, the /api/search module will overlay real mock flight+hotel costs.
 */

import { NextRequest, NextResponse } from "next/server";
import { kimi, KIMI_ITINERARY_MODEL } from "@/lib/kimi";
import { buildItineraryPrompt } from "@/lib/prompts";
import type { Itinerary, ItineraryApiRequest } from "@/types/chat";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ItineraryApiRequest;
    const { tripInputs } = body;

    // ── Validate required fields ──────────────────────────────────────────────
    const { destination, startDate, endDate, travelers, budgetINR } = tripInputs;
    if (!destination || !startDate || !endDate || !travelers || !budgetINR) {
      return NextResponse.json(
        { error: "Missing required trip inputs: destination, startDate, endDate, travelers, budgetINR" },
        { status: 400 }
      );
    }

    const prompt = buildItineraryPrompt(tripInputs);

    const completion = await kimi.chat.completions.create({
      model: KIMI_ITINERARY_MODEL,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.4, // lower temp for deterministic JSON output
      max_tokens: 4096,
    });

    const rawContent = completion.choices[0]?.message?.content ?? "";

    // ── Parse JSON from Kimi response ─────────────────────────────────────────
    // Strip any accidental markdown fences the model might add despite instructions.
    const jsonStr = rawContent
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    let parsed: Partial<Itinerary>;
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      console.error("[api/itinerary] Failed to parse JSON from Kimi. Raw:", rawContent);
      return NextResponse.json(
        { error: "AI returned an invalid format. Please try again." },
        { status: 500 }
      );
    }

    // ── Attach server-side fields ─────────────────────────────────────────────
    const itinerary: Itinerary = {
      id: randomUUID(),
      tripTitle: parsed.tripTitle ?? `Trip to ${destination}`,
      destination: parsed.destination ?? destination,
      startDate: parsed.startDate ?? startDate,
      endDate: parsed.endDate ?? endDate,
      travelers: parsed.travelers ?? travelers,
      totalBudgetINR: parsed.totalBudgetINR ?? budgetINR,
      estimatedCostINR: parsed.estimatedCostINR ?? 0,
      overBudget: parsed.overBudget ?? false,
      days: parsed.days ?? [],
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json({ itinerary });
  } catch (err) {
    console.error("[api/itinerary] Error:", err);
    return NextResponse.json(
      { error: "Failed to generate itinerary. Please try again." },
      { status: 500 }
    );
  }
}
