/**
 * app/api/chat/route.ts
 *
 * Next.js proxy route connecting Vercel Frontend to Render Express Backend / GroqCloud AI.
 */

import { NextRequest, NextResponse } from "next/server";
import { CHAT_SYSTEM_PROMPT } from "@/lib/prompts";
import { getGroqClient, GROQ_PRIMARY_MODEL, GROQ_FALLBACK_MODEL } from "@/lib/groq";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "messages array is required" }, { status: 400 });
    }

    const backendBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.VITE_API_BASE_URL;

    // Option A: Forward to Render Express Backend if configured
    if (backendBaseUrl && !backendBaseUrl.includes("localhost:3000")) {
      try {
        const backendRes = await fetch(`${backendBaseUrl.replace(/\/$/, "")}/api/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages }),
        });

        if (backendRes.ok) {
          const data = await backendRes.json();
          return NextResponse.json(data);
        }
      } catch (proxyErr) {
        console.warn("[Chat Route] Render Backend Proxy failed, executing direct Groq completion:", proxyErr);
      }
    }

    // Option B: Direct Groq completion on server-side Next.js route
    const client = getGroqClient();
    if (!client) {
      return NextResponse.json(
        { error: "⚠️ AI Service Error: GROQ_API_KEY is missing in backend environment variables." },
        { status: 500 }
      );
    }

    const formattedMessages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
      { role: "system", content: CHAT_SYSTEM_PROMPT },
      ...messages.map((m: { role: string; content: string }) => ({
        role: (m.role === "user" ? "user" : "assistant") as "user" | "assistant",
        content: m.content,
      })),
    ];

    const lastUserMsg = messages[messages.length - 1]?.content || "";
    console.log(`[DEBUG] Received User Message: "${lastUserMsg}"`);
    console.log(`[DEBUG] Selected Model: ${GROQ_PRIMARY_MODEL}`);

    try {
      const response = await client.chat.completions.create({
        model: GROQ_PRIMARY_MODEL,
        messages: formattedMessages,
        max_tokens: 1500,
        temperature: 0.7,
      });

      const replyText = response.choices[0]?.message?.content ?? null;
      console.log(`[DEBUG] Groq Response Status: 200 OK`);
      return NextResponse.json({ reply: replyText, model: GROQ_PRIMARY_MODEL });
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.warn(`[DEBUG] Primary model (${GROQ_PRIMARY_MODEL}) call failed: ${errMsg}. Trying fallback model (${GROQ_FALLBACK_MODEL})...`);

      const fallbackResponse = await client.chat.completions.create({
        model: GROQ_FALLBACK_MODEL,
        messages: formattedMessages,
        max_tokens: 1500,
        temperature: 0.7,
      });

      const replyText = fallbackResponse.choices[0]?.message?.content ?? null;
      return NextResponse.json({ reply: replyText, model: GROQ_FALLBACK_MODEL });
    }
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error("[DEBUG] /api/chat POST Exception:", errMsg);
    return NextResponse.json(
      { error: `⚠️ AI Service Error: ${errMsg}` },
      { status: 500 }
    );
  }
}
