/**
 * app/api/chat/route.ts
 *
 * Conversational chatbot endpoint using Kimi API (Moonshot AI).
 *
 * Strategy:
 * - Receives the full conversation history + any accumulated tripInputs.
 * - Sends to Kimi with the concierge system prompt.
 * - Parses the READY_TO_GENERATE marker from the response to detect when
 *   all required trip info has been collected.
 * - Returns the AI reply + updated tripInputs + readyToGenerate flag.
 *
 * NOTE: We use a non-streaming response here to keep the route simple
 * for Phase 1. The Vercel 60s limit is not a concern for a single chat
 * turn (typical Kimi response < 5s on moonshot-v1-8k).
 * If streaming is needed in Phase 2, replace with a ReadableStream response.
 */

import { NextRequest, NextResponse } from "next/server";
import { kimi, KIMI_CHAT_MODEL } from "@/lib/kimi";
import { CHAT_SYSTEM_PROMPT } from "@/lib/prompts";
import type { ChatApiRequest, ChatApiResponse, TripInputs } from "@/types/chat";

// Extracts the READY_TO_GENERATE JSON payload from the assistant's message (if present).
function extractReadyMarker(
  text: string
): { clean: string; inputs: TripInputs | null } {
  const marker = "READY_TO_GENERATE:";
  const idx = text.indexOf(marker);
  if (idx === -1) return { clean: text, inputs: null };

  const jsonStr = text.slice(idx + marker.length).trim();
  const cleanText = text.slice(0, idx).trim();

  try {
    const inputs = JSON.parse(jsonStr) as TripInputs;
    return { clean: cleanText, inputs };
  } catch {
    // Malformed JSON from AI — treat as not-ready
    return { clean: text, inputs: null };
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ChatApiRequest;
    const { messages, tripInputs } = body;

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: "messages array is required" }, { status: 400 });
    }

    // Build the messages array for Kimi: system prompt first, then conversation history.
    const kimiMessages: { role: "system" | "user" | "assistant"; content: string }[] = [
      { role: "system", content: CHAT_SYSTEM_PROMPT },
      ...messages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ];

    const completion = await kimi.chat.completions.create({
      model: KIMI_CHAT_MODEL,
      messages: kimiMessages,
      temperature: 0.7,
      max_tokens: 600,
    });

    const rawReply = completion.choices[0]?.message?.content ?? "";
    const { clean: reply, inputs: extractedInputs } = extractReadyMarker(rawReply);

    const updatedInputs: Partial<TripInputs> = {
      ...tripInputs,
      ...(extractedInputs ?? {}),
    };

    const response: ChatApiResponse = {
      reply,
      tripInputs: updatedInputs,
      readyToGenerate: extractedInputs !== null,
    };

    return NextResponse.json(response);
  } catch (err) {
    console.error("[api/chat] Error:", err);
    return NextResponse.json(
      { error: "Failed to get a response from the AI. Please try again." },
      { status: 500 }
    );
  }
}
