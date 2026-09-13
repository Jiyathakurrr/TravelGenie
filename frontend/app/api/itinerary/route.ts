/**
 * app/api/itinerary/route.ts
 *
 * Itinerary generation endpoint using GroqCloud API (openai/gpt-oss-120b).
 */

import { NextRequest, NextResponse } from "next/server";
import { getGroqClient, GROQ_PRIMARY_MODEL } from "@/lib/groq";
import { buildItineraryPrompt } from "@/lib/prompts";
import type { Itinerary, ItineraryApiRequest } from "@/types/chat";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ItineraryApiRequest;
    const { tripInputs } = body;

    const { destination, startDate, endDate, travelers, budgetINR } = tripInputs;
    if (!destination || !startDate || !endDate || !travelers || !budgetINR) {
      return NextResponse.json(
        { error: "Missing required trip inputs: destination, startDate, endDate, travelers, budgetINR" },
        { status: 400 }
      );
    }

    const prompt = buildItineraryPrompt(tripInputs);
    const client = getGroqClient();

    if (!client) {
      return NextResponse.json(
        { error: "Groq API client is not configured. Please set GROQ_API_KEY." },
        { status: 500 }
      );
    }

    const completion = await client.chat.completions.create({
      model: GROQ_PRIMARY_MODEL,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.4,
      max_tokens: 3000,
    });

    const rawContent = completion.choices[0]?.message?.content ?? "";

    const jsonStr = rawContent
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    let parsed: Partial<Itinerary>;
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      console.error("[api/itinerary] Failed to parse JSON from AI. Raw:", rawContent);
      return NextResponse.json(
        { error: "AI returned an invalid format. Please try again." },
        { status: 500 }
      );
    }

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
