/**
 * routes/chat.js
 * TravelGenie AI Chatbot powered by Google Gemini API
 * with optional MongoDB Atlas destination grounding & chat history persistence.
 */
const express = require("express");
const mongoose = require("mongoose");
const { callGeminiAI } = require("../config/gemini");

const router = express.Router();

function getDb() {
  const conn = mongoose.connection;
  if (conn && conn.readyState === 1) {
    return conn.db;
  }
  return null;
}

function extractUserEmail(req) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    if (token.startsWith("jwt_token_")) {
      try {
        const decoded = Buffer.from(token.replace("jwt_token_", ""), "base64").toString("utf8");
        if (decoded && decoded.includes("@")) return decoded.toLowerCase().trim();
      } catch (_) {}
    }
  }
  const emailHeader = req.headers["x-user-email"] || req.query.email || req.body?.userEmail;
  if (emailHeader && typeof emailHeader === "string" && emailHeader.includes("@")) {
    return emailHeader.toLowerCase().trim();
  }
  return null;
}

// POST /api/chat (and /api/chat/)
router.post("/", async (req, res) => {
  try {
    const { messages, conversationId, destination, tripContext } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "messages array is required" });
    }

    const lastUserMessage = messages.filter((m) => m.role === "user").pop();
    const userPrompt = lastUserMessage?.content || "Help me plan a trip in India.";

    let matchedDestName = destination || "";
    let groundedKnowledge = "";

    const db = getDb();

    if (db) {
      try {
        if (!matchedDestName) {
          const allDests = await db
            .collection("destination_catalog")
            .find({}, { projection: { name: 1, state: 1, type: 1 } })
            .limit(100)
            .toArray();

          for (const d of allDests) {
            if (new RegExp(`\\b${d.name}\\b`, "i").test(userPrompt)) {
              matchedDestName = d.name;
              break;
            }
          }

          if (!matchedDestName) {
            for (let i = messages.length - 1; i >= 0; i--) {
              for (const d of allDests) {
                if (new RegExp(`\\b${d.name}\\b`, "i").test(messages[i].content)) {
                  matchedDestName = d.name;
                  break;
                }
              }
              if (matchedDestName) break;
            }
          }
        }

        if (matchedDestName) {
          const destDoc = await db.collection("destination_catalog").findOne({
            $or: [
              { name: matchedDestName },
              { name: { $regex: new RegExp(`^${matchedDestName}$`, "i") } },
            ],
          });

          if (destDoc) {
            groundedKnowledge += `\n[VERIFIED DESTINATION PROFILE: ${destDoc.name}, ${destDoc.state || destDoc.stateId || ""}]\n`;
            groundedKnowledge += `- Category: ${destDoc.type || "Travel"}\n`;
            groundedKnowledge += `- Summary: ${destDoc.description || ""}\n`;
            groundedKnowledge += `- Best Time to Visit: ${Array.isArray(destDoc.bestTimeToVisit) ? destDoc.bestTimeToVisit.join(", ") : destDoc.bestTimeToVisit || "October to March"}\n`;
            if (destDoc.estimatedDailyBudget) {
              groundedKnowledge += `- Daily Budget: ₹${destDoc.estimatedDailyBudget.budget || 1200} (budget), ₹${destDoc.estimatedDailyBudget.mid || destDoc.estimatedDailyBudget.moderate || 3000} (mid-range), ₹${destDoc.estimatedDailyBudget.luxury || 7000}+ (luxury)\n`;
            }
          }

          const safetyDoc = await db.collection("destination_safety").findOne({
            $or: [
              { destinationName: { $regex: new RegExp(`^${matchedDestName}$`, "i") } },
              { name: { $regex: new RegExp(`^${matchedDestName}$`, "i") } },
            ],
          });
          if (safetyDoc) {
            groundedKnowledge += `\n[SAFETY & ADVISORY]:\n- Night Safety: ${safetyDoc.nightSafety || "Safe in central areas"}\n- Solo/Female Travelers: ${safetyDoc.soloFemaleSafety || "Moderate to high"}\n`;
          }

          const seasonDoc = await db.collection("destination_seasons").findOne({
            $or: [
              { destinationName: { $regex: new RegExp(`^${matchedDestName}$`, "i") } },
              { name: { $regex: new RegExp(`^${matchedDestName}$`, "i") } },
            ],
          });
          if (seasonDoc) {
            groundedKnowledge += `\n[WEATHER & SEASONS]:\n- Peak Season: ${seasonDoc.peakSeason || "Winter"}\n- Off-Season: ${seasonDoc.offSeason || "Monsoon"}\n`;
          }
        }
      } catch (groundingErr) {
        console.warn("[Chat Grounding] DB scan skipped:", groundingErr.message);
      }
    }

    const systemPrompt = `You are TravelGenie, an expert pan-India AI travel concierge and master itinerary planner based in India.
Your mission is to provide realistic, intelligent, highly specific, and authentic travel recommendations across India and worldwide.

CORE BEHAVIOR RULES:
1. TRIP DETAILS COLLECTION: When planning a trip or itinerary, ensure you collect all required trip details from the user:
   - Destination
   - Start date and End date (specific travel dates)
   - Trip duration (number of days & nights)
   - Number of travelers (e.g. solo, couple, family/group size)
   - Budget preference (in INR ₹) & travel style
   If any of these details (especially dates and duration) are missing, actively ask the user for them. Never guess, assume, or fabricate missing travel dates or duration.
2. ACCURATE ITINERARY GENERATION: Use the exact dates, duration, and traveler counts provided by the user when generating the complete day-by-day itinerary.
3. STRUCTURED ITINERARY FORMAT: Structure day-by-day plans clearly (e.g. Day 1, Day 2, Morning, Afternoon, Evening) including transit options (Flight, Train, Bus, Cab), realistic fares in Indian Rupees (₹), and verified sightseeing spots.
4. For greetings ("Hello", "Hi"), respond warmly and ask for their desired destination, travel dates, duration, number of travelers, and budget.
5. For safety, season, culinary, or local queries, give concrete, actionable insights grounded in real destination knowledge.

${groundedKnowledge ? `GROUNDED DESTINATION KNOWLEDGE:\n${groundedKnowledge}` : ""}`.trim();

    const result = await callGeminiAI(systemPrompt, messages);

    if (result.text) {
      // Auto-save conversation to MongoDB if userEmail or conversationId is provided
      const userEmail = extractUserEmail(req);
      if (db && (userEmail || conversationId)) {
        try {
          const convoId = conversationId || `conv_${Date.now().toString(36)}`;
          const now = new Date();
          const cleanEmail = userEmail || "guest@travelgenie.in";
          const updatedMessages = [
            ...messages,
            {
              id: "msg_" + Math.random().toString(36).substring(2, 9),
              role: "assistant",
              content: result.text,
              createdAt: now.toISOString(),
            },
          ];
          const convoTitle = matchedDestName ? `Trip to ${matchedDestName}` : userPrompt.slice(0, 35);
          await db.collection("chat_conversations").updateOne(
            { id: convoId, userEmail: cleanEmail },
            {
              $set: {
                id: convoId,
                userEmail: cleanEmail,
                title: convoTitle,
                destination: matchedDestName || "",
                messages: updatedMessages,
                updatedAt: now,
              },
              $setOnInsert: { createdAt: now },
            },
            { upsert: true }
          );
        } catch (saveErr) {
          console.warn("[Chat] Auto-save conversation warning:", saveErr.message);
        }
      }

      return res.json({
        reply: result.text,
        matchedDestination: matchedDestName,
        model: result.model,
      });
    }

    return res.status(500).json({
      error: result.error || "Unable to reach Gemini AI service. Please check API key configuration.",
      reply: "Namaste! I encountered a temporary connection issue while contacting the Gemini AI engine. Please verify your GEMINI_API_KEY.",
    });
  } catch (err) {
    console.error("[Chat API Error]:", err);
    return res.status(500).json({ error: "Failed to process chat request.", detail: err.message });
  }
});

// GET /api/chat/history
router.get("/history", async (req, res) => {
  try {
    const email = extractUserEmail(req);
    if (!email) {
      return res.json({ conversations: [] });
    }
    const db = getDb();
    if (!db) {
      return res.json({ conversations: [] });
    }
    const conversations = await db
      .collection("chat_conversations")
      .find({ userEmail: email })
      .sort({ updatedAt: -1 })
      .toArray();
    return res.json({ conversations });
  } catch (err) {
    console.error("[Chat History Error]:", err);
    return res.status(500).json({ error: "Failed to load chat history", conversations: [] });
  }
});

// POST /api/chat/save
router.post("/save", async (req, res) => {
  try {
    const email = extractUserEmail(req) || req.body.userEmail;
    if (!email) {
      return res.status(401).json({ error: "Authentication required to save chat history" });
    }
    const { conversationId, messages, title, destination } = req.body;
    if (!conversationId || !messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "conversationId and messages array are required" });
    }
    const db = getDb();
    if (!db) {
      return res.json({ success: true, conversationId });
    }
    const now = new Date();
    const convoTitle = title || (destination ? `Trip to ${destination}` : "Travel Plan");
    await db.collection("chat_conversations").updateOne(
      { id: conversationId, userEmail: email.toLowerCase().trim() },
      {
        $set: {
          id: conversationId,
          userEmail: email.toLowerCase().trim(),
          title: convoTitle,
          destination: destination || "",
          messages,
          updatedAt: now,
        },
        $setOnInsert: { createdAt: now },
      },
      { upsert: true }
    );
    return res.json({ success: true, conversationId });
  } catch (err) {
    console.error("[Chat Save Error]:", err);
    return res.status(500).json({ error: "Failed to save conversation" });
  }
});

module.exports = router;
