/**
 * config/gemini.js
 * Gemini AI configuration & REST client helper for TravelGenie
 */

function getGeminiApiKey() {
  return (
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.GOOGLE_GENAI_API_KEY ||
    process.env.GEMINI_KEY ||
    ""
  ).trim();
}

const GEMINI_MODEL = "gemini-3.6-flash";

/**
 * Calls the Google Gemini REST API using native fetch with gemini-3.6-flash.
 * @param {string} systemPrompt System instruction for the assistant
 * @param {Array<{role: string, content: string}>} messages Conversation messages
 * @returns {Promise<{text: string|null, model: string|null, error: string|null}>}
 */
async function callGeminiAI(systemPrompt, messages) {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    console.error("[Gemini] GEMINI_API_KEY is not configured in backend environment variables.");
    return {
      text: null,
      model: null,
      error: "GEMINI_API_KEY is missing in backend environment variables.",
    };
  }

  // Format messages into Gemini contents format
  const contents = [];
  for (const m of messages) {
    const role = m.role === "assistant" || m.role === "model" ? "model" : "user";
    const text = typeof m.content === "string" ? m.content.trim() : "";
    if (text) {
      contents.push({
        role,
        parts: [{ text }],
      });
    }
  }

  // Ensure there's at least one message and the first message is from user
  if (contents.length === 0) {
    contents.push({
      role: "user",
      parts: [{ text: "Hello, help me plan a trip in India." }],
    });
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

    const payload = {
      contents,
      systemInstruction: systemPrompt
        ? {
            parts: [{ text: systemPrompt }],
          }
        : undefined,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2000,
      },
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data?.error?.message || `HTTP ${response.status}: ${response.statusText}`;
      console.warn(`[Gemini] Model ${GEMINI_MODEL} returned error: ${errorMsg}`);
      return {
        text: null,
        model: GEMINI_MODEL,
        error: errorMsg,
      };
    }

    const candidate = data?.candidates?.[0];
    const replyText = candidate?.content?.parts?.map((p) => p.text).join("") || null;

    if (replyText) {
      return { text: replyText, model: GEMINI_MODEL, error: null };
    }

    return {
      text: null,
      model: GEMINI_MODEL,
      error: "Empty response returned by Gemini model.",
    };
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error(`[Gemini] Call to model ${GEMINI_MODEL} failed: ${errMsg}`);
    return {
      text: null,
      model: GEMINI_MODEL,
      error: errMsg,
    };
  }
}

module.exports = {
  getGeminiApiKey,
  GEMINI_MODEL,
  callGeminiAI,
};
