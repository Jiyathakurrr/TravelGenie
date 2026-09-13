/**
 * app/api/chat/route.ts
 *
 * Travel Genie AI Chatbot Endpoint — Powered by official GroqCloud API (openai/gpt-oss-120b)
 * - Sends full conversation history and current user query directly to Groq.
 * - Dynamic AI responses for freestyle queries, general questions, travel advice, and itinerary generation.
 * - Clear error handling with server-side debug logs (no hardcoded fallback paragraph).
 */

import { NextRequest, NextResponse } from "next/server";
import { CHAT_SYSTEM_PROMPT } from "@/lib/prompts";
import { getGroqClient, GROQ_PRIMARY_MODEL, GROQ_FALLBACK_MODEL } from "@/lib/groq";

/**
 * Call official GroqCloud API with primary model (openai/gpt-oss-120b)
 * or fallback model (llama-3.3-70b-versatile) on rate limits (429).
 */
async function callGroqAI(
  systemPrompt: string,
  messages: Array<{ role: string; content: string }>
): Promise<{ text: string | null; status: number; modelUsed: string; errorMsg?: string }> {
  const client = getGroqClient();
  if (!client) {
    console.error("[DEBUG] Groq client initialization failed: GROQ_API_KEY is not set in environment.");
    return { text: null, status: 500, modelUsed: "none", errorMsg: "GROQ_API_KEY is missing in backend environment variables." };
  }

  // Explicitly format messages for OpenAI SDK compatibility
  const formattedMessages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
    { role: "system", content: systemPrompt },
    ...messages.map((m) => ({
      role: (m.role === "user" ? "user" : "assistant") as "user" | "assistant",
      content: m.content,
    })),
  ];

  console.log(`[DEBUG] Selected Model: ${GROQ_PRIMARY_MODEL}`);
  console.log(`[DEBUG] Conversation History Length: ${messages.length}`);

  try {
    const response = await client.chat.completions.create({
      model: GROQ_PRIMARY_MODEL,
      messages: formattedMessages,
      max_tokens: 1500,
      temperature: 0.7,
    });

    const replyText = response.choices[0]?.message?.content ?? null;
    console.log(`[DEBUG] Groq Response Status: 200 OK`);
    console.log(`[DEBUG] Returned Response Text Preview: "${replyText?.substring(0, 100).replace(/\n/g, " ")}..."`);

    return { text: replyText, status: 200, modelUsed: GROQ_PRIMARY_MODEL };
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.warn(`[DEBUG] Primary model (${GROQ_PRIMARY_MODEL}) call failed: ${errMsg}. Trying fallback model (${GROQ_FALLBACK_MODEL})...`);

    try {
      const fallbackResponse = await client.chat.completions.create({
        model: GROQ_FALLBACK_MODEL,
        messages: formattedMessages,
        max_tokens: 1500,
        temperature: 0.7,
      });

      const replyText = fallbackResponse.choices[0]?.message?.content ?? null;
      console.log(`[DEBUG] Groq Fallback Response Status: 200 OK (Model: ${GROQ_FALLBACK_MODEL})`);
      console.log(`[DEBUG] Returned Response Text Preview: "${replyText?.substring(0, 100).replace(/\n/g, " ")}..."`);

      return { text: replyText, status: 200, modelUsed: GROQ_FALLBACK_MODEL };
    } catch (fallbackErr: unknown) {
      const fbMsg = fallbackErr instanceof Error ? fallbackErr.message : String(fallbackErr);
      console.error(`[DEBUG] Groq Response Status: Error (Fallback also failed: ${fbMsg})`);
      return { text: null, status: 500, modelUsed: GROQ_FALLBACK_MODEL, errorMsg: fbMsg };
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "messages array is required" }, { status: 400 });
    }

    const lastUserMsg = messages[messages.length - 1]?.content || "";
    console.log(`[DEBUG] Received User Message: "${lastUserMsg}"`);

    // Call Groq AI with full context and conversation history
    const result = await callGroqAI(CHAT_SYSTEM_PROMPT, messages);

    if (result.text) {
      return NextResponse.json({ reply: result.text, model: result.modelUsed });
    }

    // Return explicit error message if Groq API fails (NO hardcoded fallback text)
    const displayError = result.errorMsg || "Unable to reach GroqCloud AI service. Please check API key configuration or try again.";
    return NextResponse.json(
      { error: `⚠️ AI Service Error: ${displayError}` },
      { status: 500 }
    );
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error("[DEBUG] /api/chat POST Exception:", errMsg);
    return NextResponse.json(
      { error: `⚠️ Internal Server Error: ${errMsg}` },
      { status: 500 }
    );
  }
}
