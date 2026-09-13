const OpenAI = require("openai");

function getGroqClient() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;
  return new OpenAI({
    apiKey,
    baseURL: "https://api.groq.com/openai/v1",
  });
}

const GROQ_PRIMARY_MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";
const GROQ_FALLBACK_MODEL = "llama-3.3-70b-versatile";

module.exports = {
  getGroqClient,
  GROQ_PRIMARY_MODEL,
  GROQ_FALLBACK_MODEL,
};
