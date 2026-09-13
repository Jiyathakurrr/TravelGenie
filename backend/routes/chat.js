const express = require("express");
const { getGroqClient, GROQ_PRIMARY_MODEL, GROQ_FALLBACK_MODEL } = require("../config/groq");
const Conversation = require("../models/Conversation");

const router = express.Router();

const SYSTEM_PROMPT = `
You are TravelGenie, an intelligent, warm, and highly capable AI travel concierge for pan-India and worldwide travel planning.
Tailor your answers directly to the user's latest query:
- For casual greetings ("Hello", "How are you"), reply conversationally and warmly.
- For general travel/accommodation questions, give clear informative explanations.
- For destination advice or itinerary requests, provide structured 3-4 option travel plans (Flight, Train, Bus, Cab) with realistic estimated fares in INR.
- Always include clear disclaimers that fares, schedules, and live availability must be verified on official booking portals.
`.trim();

async function callGroqAI(messages) {
  const client = getGroqClient();
  if (!client) {
    console.error("[Groq] GROQ_API_KEY is not configured in backend environment variables.");
    return { text: null, error: "GROQ_API_KEY is missing in backend environment variables." };
  }

  const formattedMessages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...messages.map((m) => ({
      role: m.role === "user" ? "user" : "assistant",
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
    return { text: replyText, model: GROQ_PRIMARY_MODEL };
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.warn(`[Groq] Primary model (${GROQ_PRIMARY_MODEL}) call failed: ${errMsg}. Trying fallback model (${GROQ_FALLBACK_MODEL})...`);

    try {
      const fallbackResponse = await client.chat.completions.create({
        model: GROQ_FALLBACK_MODEL,
        messages: formattedMessages,
        max_tokens: 1500,
        temperature: 0.7,
      });

      const replyText = fallbackResponse.choices[0]?.message?.content ?? null;
      console.log(`[DEBUG] Groq Fallback Response Status: 200 OK (${GROQ_FALLBACK_MODEL})`);
      return { text: replyText, model: GROQ_FALLBACK_MODEL };
    } catch (fallbackErr) {
      const fbMsg = fallbackErr instanceof Error ? fallbackErr.message : String(fallbackErr);
      console.error(`[Groq] Fallback model (${GROQ_FALLBACK_MODEL}) call also failed: ${fbMsg}`);
      return { text: null, error: fbMsg };
    }
  }
}

// POST /api/chat
router.post("/", async (req, res) => {
  try {
    const { messages, userId } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "messages array is required" });
    }

    const lastUserMsg = messages[messages.length - 1]?.content || "";
    console.log(`[DEBUG] Received User Message: "${lastUserMsg}"`);

    const result = await callGroqAI(messages);

    if (result.text) {
      // Async persist conversation to MongoDB if available
      try {
        if (userId) {
          await Conversation.create({ userId, messages });
        }
      } catch (dbErr) {
        // Log & proceed
      }

      return res.json({ reply: result.text, model: result.model });
    }

    return res.status(500).json({
      error: `⚠️ AI Service Error: ${result.error || "Unable to reach GroqCloud AI service. Please check API key configuration."}`
    });
  } catch (err) {
    console.error("[Chat API Error]:", err);
    return res.status(500).json({ error: "Failed to process chat request." });
  }
});

module.exports = router;
