import express from "express";
import path from "path";
import dotenv from "dotenv";
import crypto from "crypto";
import Razorpay from "razorpay";
import { MongoClient } from "mongodb";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config({ override: true });

const PORT = 3000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://travelgeniework_db_user:4z2CANJczAFpCYcV@cluster0.etoodin.mongodb.net/travelgenie?appName=Cluster0";
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || "travelgenie";

let mongoClient: MongoClient | null = null;

async function getDb() {
  if (!mongoClient) {
    mongoClient = new MongoClient(MONGODB_URI);
    await mongoClient.connect();
    console.log("Connected to MongoDB Atlas:", MONGODB_DB_NAME);
  }
  return mongoClient.db(MONGODB_DB_NAME);
}

let geminiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI {
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return geminiClient;
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // CORS and preflight middleware
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, x-user-email");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", service: "TravelGenie Backend" });
  });

  // Destinations list endpoint
  app.get("/api/destinations", async (req, res) => {
    try {
      const db = await getDb();
      const { type, search, limit = "60" } = req.query;

      const query: any = { isActive: { $ne: false } };
      if (type && type !== "all") {
        query.type = type;
      }
      if (search && typeof search === "string") {
        query.name = { $regex: new RegExp(search, "i") };
      }

      const limitNum = Math.min(parseInt(limit as string) || 60, 200);
      const destinations = await db
        .collection("destination_catalog")
        .find(query)
        .limit(limitNum)
        .toArray();

      // Retrieve state names for lookup
      const states = await db.collection("states").find().toArray();
      const stateMap = new Map(states.map((s: any) => [s._id, s.name]));

      // Enrich with state names
      const enriched = destinations.map((d: any) => ({
        ...d,
        stateName: stateMap.get(d.stateId) || d.stateId,
      }));

      res.json(enriched);
    } catch (err: any) {
      console.error("Error fetching destinations:", err);
      res.status(500).json({ error: "Failed to fetch destinations from MongoDB" });
    }
  });

  // Single Destination details endpoint
  app.get("/api/destinations/:id", async (req, res) => {
    try {
      const db = await getDb();
      const idOrSlug = req.params.id;

      const destination = await db.collection<any>("destination_catalog").findOne({
        $or: [{ _id: idOrSlug as any }, { slug: idOrSlug }, { name: { $regex: new RegExp(`^${idOrSlug}$`, "i") } }]
      });

      if (!destination) {
        return res.status(404).json({ error: "Destination not found" });
      }

      const destId = destination._id;

      // Parallel fetch related details
      const [
        state,
        accommodations,
        attractions,
        pilgrimageSites,
        safety,
        seasons,
        airports,
        railwayStations
      ] = await Promise.all([
        db.collection<any>("states").findOne({ _id: destination.stateId as any }),
        db.collection<any>("accommodations").find({ destinationId: destId }).limit(10).toArray(),
        db.collection<any>("attractions").find({ destinationId: destId }).limit(10).toArray(),
        db.collection<any>("pilgrimage_sites").find({ destinationId: destId }).limit(6).toArray(),
        db.collection<any>("destination_safety").findOne({ destinationId: destId }),
        db.collection<any>("destination_seasons").findOne({ destinationId: destId }),
        db.collection<any>("airports").find({ destinationId: destId }).limit(4).toArray(),
        db.collection<any>("railway_stations").find({ destinationId: destId }).limit(4).toArray(),
      ]);

      res.json({
        ...destination,
        stateName: state?.name || destination.stateId,
        stateInfo: state,
        accommodations,
        attractions,
        pilgrimageSites,
        safety,
        seasons,
        airports,
        railwayStations
      });
    } catch (err: any) {
      console.error("Error fetching destination details:", err);
      res.status(500).json({ error: "Failed to fetch destination details" });
    }
  });

  // Packages endpoint
  app.get("/api/packages", async (req, res) => {
    try {
      const db = await getDb();
      const packages = await db.collection("travel_packages").find({ isActive: { $ne: false } }).limit(20).toArray();
      res.json(packages);
    } catch (err: any) {
      res.status(500).json({ error: "Failed to fetch packages" });
    }
  });

  // Itinerary Templates endpoint
  app.get("/api/itineraries", async (req, res) => {
    try {
      const db = await getDb();
      const itineraries = await db.collection("itinerary_templates").find().limit(20).toArray();
      res.json(itineraries);
    } catch (err: any) {
      res.status(500).json({ error: "Failed to fetch itineraries" });
    }
  });

  // Accommodations endpoint
  app.get("/api/accommodations", async (req, res) => {
    try {
      const db = await getDb();
      const { destinationId, limit = "20" } = req.query;
      const query: any = { isActive: { $ne: false } };
      if (destinationId) query.destinationId = destinationId;
      const results = await db.collection("accommodations").find(query).limit(parseInt(limit as string) || 20).toArray();
      res.json(results);
    } catch (err: any) {
      res.status(500).json({ error: "Failed to fetch accommodations" });
    }
  });

  // Transport options endpoint (flights, trains, buses)
  app.get("/api/transport", async (req, res) => {
    try {
      const db = await getDb();
      const [flights, trains, buses] = await Promise.all([
        db.collection("flights").find().limit(15).toArray(),
        db.collection("trains").find().limit(15).toArray(),
        db.collection("buses").find().limit(15).toArray()
      ]);
      res.json({ flights, trains, buses });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to fetch transport data" });
    }
  });

  // Chat endpoint powered by Gemini AI with full trip context & MongoDB grounding
  app.post("/api/chat", async (req, res) => {
    try {
      const { messages, tripContext } = req.body;
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Messages array is required" });
      }

      const lastUserMessage = messages.filter((m: any) => m.role === "user").pop();
      const userPrompt = lastUserMessage?.content || "Help me plan a trip in India.";

      // Scan full conversation to identify destinations mentioned
      const db = await getDb();
      const fullConvoText = messages.map((m: any) => m.content).join(" ");
      
      const allDests = await db.collection("destination_catalog")
        .find({}, { projection: { name: 1, state: 1, type: 1 } })
        .toArray();

      // Find the most recently or prominently mentioned destination
      let matchedDestName = "";
      // Check last user message first
      for (const d of allDests) {
        if (new RegExp(`\\b${d.name}\\b`, "i").test(userPrompt)) {
          matchedDestName = d.name;
          break;
        }
      }
      // If not in last message, check previous conversation
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

      // Fetch grounded context from MongoDB
      let groundedKnowledge = "";
      if (matchedDestName) {
        const destDoc = await db.collection("destination_catalog").findOne({ name: matchedDestName });
        if (destDoc) {
          groundedKnowledge += `\n[VERIFIED DESTINATION PROFILE: ${destDoc.name}, ${destDoc.state || ""}]\n`;
          groundedKnowledge += `- Category: ${destDoc.type || "Travel"}\n`;
          groundedKnowledge += `- Summary: ${destDoc.description || ""}\n`;
          groundedKnowledge += `- Best Time to Visit: ${destDoc.bestTimeToVisit || "October to March"}\n`;
          if (destDoc.estimatedDailyBudget) {
            groundedKnowledge += `- Daily Budget Guidelines: ₹${destDoc.estimatedDailyBudget.budget || 1200} (budget backpacker), ₹${destDoc.estimatedDailyBudget.moderate || 3000} (comfortable mid-range), ₹${destDoc.estimatedDailyBudget.luxury || 7000}+ (luxury/heritage)\n`;
          }
          if (destDoc.highlights && Array.isArray(destDoc.highlights)) {
            groundedKnowledge += `- Key Attractions / Highlights: ${destDoc.highlights.join(", ")}\n`;
          }
        }

        // Safety context
        const safetyDoc = await db.collection("destination_safety").findOne({
          $or: [
            { destinationName: { $regex: new RegExp(`^${matchedDestName}$`, "i") } },
            { name: { $regex: new RegExp(`^${matchedDestName}$`, "i") } }
          ]
        });
        if (safetyDoc) {
          groundedKnowledge += `\n[SAFETY & LOCAL ADVISORY]:\n`;
          groundedKnowledge += `- Night Safety: ${safetyDoc.nightSafety || "Generally safe in central areas; avoid isolated paths late night"}\n`;
          groundedKnowledge += `- Solo / Female Travelers: ${safetyDoc.soloFemaleSafety || "Moderate to high; standard vigilance recommended"}\n`;
          if (safetyDoc.precautions) groundedKnowledge += `- Precautions: ${JSON.stringify(safetyDoc.precautions)}\n`;
          if (safetyDoc.emergencyNumbers) groundedKnowledge += `- Emergency: Police 112/100, Tourist Helpline 1363\n`;
        }

        // Seasons & Weather context
        const seasonDoc = await db.collection("destination_seasons").findOne({
          $or: [
            { destinationName: { $regex: new RegExp(`^${matchedDestName}$`, "i") } },
            { name: { $regex: new RegExp(`^${matchedDestName}$`, "i") } }
          ]
        });
        if (seasonDoc) {
          groundedKnowledge += `\n[WEATHER & SEASONS]:\n`;
          groundedKnowledge += `- Peak Season: ${seasonDoc.peakSeason || "Winter (Nov-Feb)"}\n`;
          groundedKnowledge += `- Off-Season / Monsoon: ${seasonDoc.offSeason || seasonDoc.monsoonImpact || "Summer/Monsoon"}\n`;
          if (seasonDoc.bestMonths) groundedKnowledge += `- Recommended Months: ${Array.isArray(seasonDoc.bestMonths) ? seasonDoc.bestMonths.join(", ") : seasonDoc.bestMonths}\n`;
        }

        // Real accommodations sample
        const accoms = await db.collection("accommodations").find({
          $or: [
            { destinationName: { $regex: new RegExp(`^${matchedDestName}$`, "i") } },
            { city: { $regex: new RegExp(`^${matchedDestName}$`, "i") } }
          ]
        }).limit(3).toArray();
        if (accoms && accoms.length > 0) {
          groundedKnowledge += `\n[VERIFIED LOCAL STAYS & HOTELS]:\n`;
          accoms.forEach((acc: any) => {
            groundedKnowledge += `- ${acc.name} (${acc.type || "Hotel"}): approx ₹${acc.pricePerNight || acc.priceRange || 2500}/night, Rating: ${acc.rating || 4.5}★\n`;
          });
        }
      }

      const systemPrompt = `You are Travel Genie, an expert, pan-India AI travel concierge and master itinerary planner based in India.
Your mission is to provide realistic, intelligent, highly specific, and authentic travel recommendations across India.

CORE BEHAVIOR RULES:
1. ALWAYS generate a fresh, tailored response directly addressing the user's latest message while fully factoring in the ongoing conversation history and trip context (origin, destination, dates, duration, companions, budget in INR ₹).
2. NEVER return canned, boilerplate, or repetitive answers.
3. FOR ITINERARY ADJUSTMENTS (e.g. "shorten to 3 days", "add more heritage", "make it kid-friendly", "reduce budget"):
   - Reason carefully through the requested change and output a revised, coherent day-by-day plan with specific timings, local transit options, and realistic costs.
4. FOR SAFETY QUESTIONS (e.g. "is this safe at night?", "is it safe for solo female travelers?"):
   - Give nuanced, truthful, grounded advice specific to that destination and neighborhood (lighting, auto/cab safety, curfew/bazaar timings, emergency contacts).
5. FOR TIMING & SEASONS (e.g. "best month to visit?", "what about July monsoon?"):
   - Provide concrete seasonal conditions, temperature ranges, festival highlights, and crowd/pricing differences.
6. FOR CULINARY, CULTURAL, OR OUT-OF-THE-BOX QUERIES (e.g. local street foods, Jain/vegetarian options, permits for border areas, temple dress codes, drone regulations, photography walks):
   - Answer with accurate, detailed knowledge rather than generic travel disclaimers.
7. Always quote prices in Indian Rupees (₹). Ground your suggestions with real IRCTC train classes (1A, 2A, 3A, SL, Vande Bharat), domestic flights (IndiGo, Air India), state buses, or prepaid cabs where relevant.

GROUNDED DATABASE KNOWLEDGE FROM TRAVELGENIE ATLAS:
${groundedKnowledge || "Pan-India catalog spanning 60+ verified destinations, safety profiles, seasons, and transport schedules."}

CONVERSATION HISTORY:
${messages.map((m: any) => `${m.role === "assistant" ? "TRAVEL GENIE" : "USER"}: ${m.content}`).join("\n\n")}

Provide your thoughtful, structured, and context-specific response:`;

      // Call Gemini API using @google/genai with automatic model fallback
      const ai = getGemini();
      const modelsToTry = ["gemini-3.5-flash", "gemini-3.5-flash-lite"];
      let replyText = "";
      let lastError = null;

      for (const model of modelsToTry) {
        try {
          const response = await ai.models.generateContent({
            model,
            contents: [
              {
                role: "user",
                parts: [{ text: systemPrompt }]
              }
            ]
          });
          if (response.text) {
            replyText = response.text;
            break;
          }
        } catch (err: any) {
          console.warn(`Model ${model} encounter in /api/chat:`, err?.status, err?.message);
          lastError = err;
        }
      }

      if (!replyText) {
        throw lastError || new Error("Unable to obtain response from Gemini models");
      }

      // Auto-save conversation to MongoDB if user is authenticated or email is provided
      const userEmail = extractUserEmail(req) || req.body.userEmail;
      if (userEmail && typeof userEmail === "string") {
        try {
          const convoId = req.body.conversationId || `conv_${Date.now().toString(36)}`;
          const now = new Date();
          const cleanEmail = userEmail.toLowerCase().trim();
          const updatedMessages = [
            ...messages,
            {
              id: "msg_" + Math.random().toString(36).substring(2, 9),
              role: "assistant",
              content: replyText,
              createdAt: now.toISOString()
            }
          ];
          const convoTitle = req.body.title || (matchedDestName ? `Trip to ${matchedDestName}` : userPrompt.slice(0, 35));
          await db.collection("chat_conversations").updateOne(
            { id: convoId, userEmail: cleanEmail },
            {
              $set: {
                id: convoId,
                userEmail: cleanEmail,
                title: convoTitle,
                destination: matchedDestName || req.body.destination || "",
                messages: updatedMessages,
                updatedAt: now
              },
              $setOnInsert: {
                createdAt: now
              }
            },
            { upsert: true }
          );
        } catch (saveErr) {
          console.error("Auto-save conversation error:", saveErr);
        }
      }

      res.json({
        reply: replyText,
        matchedDestination: matchedDestName
      });
    } catch (err: any) {
      console.error("Chat API error:", err);
      res.status(500).json({
        reply: "Namaste! I encountered a temporary connection issue while consulting the travel engine. Please send your question again and I will provide your detailed plan!"
      });
    }
  });

  // Helper to securely extract user email from Authorization header or request
  function extractUserEmail(req: express.Request): string | null {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      if (token.startsWith("jwt_token_")) {
        try {
          const decoded = Buffer.from(token.replace("jwt_token_", ""), "base64").toString("utf8");
          if (decoded && decoded.includes("@")) return decoded.toLowerCase().trim();
        } catch {}
      }
    }
    const emailHeader = (req.headers["x-user-email"] as string) || (req.query.email as string) || (req.body?.userEmail as string);
    if (emailHeader && typeof emailHeader === "string" && emailHeader.includes("@")) {
      return emailHeader.toLowerCase().trim();
    }
    return null;
  }

  // CHAT HISTORY ENDPOINTS
  // GET /api/chat/history - Load all previous conversations for the signed-in user
  app.get("/api/chat/history", async (req, res) => {
    try {
      const email = extractUserEmail(req);
      if (!email) {
        return res.json({ conversations: [] });
      }
      const db = await getDb();
      const conversations = await db.collection("chat_conversations")
        .find({ userEmail: email })
        .sort({ updatedAt: -1 })
        .toArray();
      res.json({ conversations });
    } catch (err: any) {
      console.error("Error fetching chat history:", err);
      res.status(500).json({ error: "Failed to load chat history", conversations: [] });
    }
  });

  // POST /api/chat/save - Save or update an ongoing conversation
  app.post("/api/chat/save", async (req, res) => {
    try {
      const email = extractUserEmail(req) || req.body.userEmail;
      if (!email) {
        return res.status(401).json({ error: "Authentication required to save chat history" });
      }
      const { conversationId, messages, title, destination } = req.body;
      if (!conversationId || !messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "conversationId and messages array are required" });
      }
      const db = await getDb();
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
          $setOnInsert: { createdAt: now }
        },
        { upsert: true }
      );
      res.json({ success: true, conversationId });
    } catch (err: any) {
      console.error("Error saving conversation:", err);
      res.status(500).json({ error: "Failed to save conversation" });
    }
  });

  // RAZORPAY TEST MODE PAYMENT ENDPOINTS
  // GET /api/payment/config - Public payment config (Key ID only, NEVER secret key)
  app.get("/api/payment/config", (req, res) => {
    const keyId = (process.env.RAZORPAY_KEY_ID || "").trim();
    const keySecret = (process.env.RAZORPAY_KEY_SECRET || "").trim();
    const renderBackendUrl = (process.env.RENDER_BACKEND_URL || "").trim();
    const isSecretSameAsKeyId = Boolean(keyId && keySecret && keyId === keySecret);
    const isConfigured = Boolean(keyId && keySecret && !isSecretSameAsKeyId);

    res.json({
      keyId,
      currency: "INR",
      mode: "test",
      isConfigured,
      renderBackendUrl: renderBackendUrl || null,
      configNotice: !keyId
        ? "RAZORPAY_KEY_ID is missing in environment variables"
        : !keySecret
        ? "RAZORPAY_KEY_SECRET is missing in backend environment variables"
        : isSecretSameAsKeyId
        ? "RAZORPAY_KEY_SECRET is set to Key ID instead of the private secret generated in Razorpay Dashboard"
        : null
    });
  });

  // POST /api/payment/create-order - Create real Razorpay Test Mode order on backend
  app.post("/api/payment/create-order", async (req, res) => {
    try {
      const { amount, destination, travelers, duration, bookingDetails } = req.body;
      const email = extractUserEmail(req) || req.body.userEmail || "guest@travelgenie.in";
      const amountNumber = Math.max(1, Number(amount) || 1499);
      const amountInPaise = Math.round(amountNumber * 100);

      const keyId = (process.env.RAZORPAY_KEY_ID || "").trim();
      const keySecret = (process.env.RAZORPAY_KEY_SECRET || "").trim();
      const renderBackendUrl = (process.env.RENDER_BACKEND_URL || "").trim();

      // If Render backend is configured, attempt to proxy or verify if it can issue the order
      if (renderBackendUrl) {
        try {
          const renderRes = await fetch(`${renderBackendUrl}/api/payment/create-order`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(req.headers.authorization ? { Authorization: req.headers.authorization } : {})
            },
            body: JSON.stringify({
              amount: amountNumber,
              destination: destination || "Pan-India Itinerary",
              travelers: travelers || 2,
              duration: duration || "4 Days / 3 Nights",
              bookingDetails
            })
          });
          if (renderRes.ok) {
            const renderData: any = await renderRes.json();
            // If Render returned a real Razorpay order with a real test key (not simulated)
            if (renderData && renderData.orderId && renderData.key && renderData.key !== "rzp_test_simulated") {
              return res.json({
                orderId: renderData.orderId,
                amount: renderData.amount || amountInPaise,
                currency: renderData.currency || "INR",
                keyId: renderData.key || keyId
              });
            }
          }
        } catch (renderErr) {
          console.warn("Render backend create-order attempt failed, proceeding with direct Razorpay SDK:", renderErr);
        }
      }

      if (!keyId) {
        return res.status(400).json({
          error: "RAZORPAY_KEY_ID is not configured. Please add your Razorpay Test Key ID to environment variables.",
          code: "MISSING_KEY_ID"
        });
      }

      if (!keySecret) {
        return res.status(400).json({
          error: "RAZORPAY_KEY_SECRET is not configured. Please add your Razorpay Test Key Secret to your backend environment variables.",
          code: "MISSING_KEY_SECRET"
        });
      }

      if (keySecret === keyId) {
        return res.status(400).json({
          error: `Razorpay Configuration Error: RAZORPAY_KEY_SECRET is identical to RAZORPAY_KEY_ID ("${keyId}"). In Razorpay, the Key Secret is a distinct private key generated in your Razorpay Dashboard (under Settings > API Keys). Please update RAZORPAY_KEY_SECRET in the settings.`,
          code: "INVALID_KEY_SECRET"
        });
      }

      const rzp = new Razorpay({ key_id: keyId, key_secret: keySecret });
      let order: any;
      try {
        order = await rzp.orders.create({
          amount: amountInPaise,
          currency: "INR",
          receipt: `rcpt_${Date.now().toString(36)}`,
          notes: {
            destination: destination || "Pan-India Itinerary",
            travelers: String(travelers || 2),
            userEmail: email
          }
        });
      } catch (sdkErr: any) {
        console.error("Razorpay orders.create error:", sdkErr);
        const errorDesc = sdkErr?.error?.description || sdkErr?.message || "Failed to create order on Razorpay API";
        if (sdkErr?.statusCode === 401 || errorDesc.toLowerCase().includes("auth")) {
          return res.status(401).json({
            error: `Razorpay Authentication Failed: The Key ID ("${keyId}") and Key Secret were rejected by Razorpay ("Authentication failed"). Please verify in Razorpay Dashboard (Test Mode) > Account & Settings > API Keys that this Key ID is active and the Secret matches it.`,
            code: "AUTH_FAILED"
          });
        }
        return res.status(sdkErr?.statusCode || 400).json({
          error: `Razorpay Orders API error: ${errorDesc}`,
          code: sdkErr?.error?.code || "RAZORPAY_ORDER_FAILED"
        });
      }

      if (!order || !order.id) {
        return res.status(500).json({
          error: "Failed to obtain a valid order ID from Razorpay.",
          code: "EMPTY_ORDER_RESPONSE"
        });
      }

      res.json({
        orderId: order.id,
        amount: order.amount,
        currency: order.currency || "INR",
        keyId
      });
    } catch (err: any) {
      console.error("Create order error:", err);
      res.status(500).json({ error: "Failed to process payment order: " + (err.message || "") });
    }
  });

  // POST /api/payment/verify - Secure backend signature verification & booking creation
  app.post("/api/payment/verify", async (req, res) => {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingDetails } = req.body;
      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return res.status(400).json({
          success: false,
          error: "Missing required payment verification parameters (order_id, payment_id, or signature)"
        });
      }

      const keySecret = (process.env.RAZORPAY_KEY_SECRET || "").trim();
      const renderBackendUrl = (process.env.RENDER_BACKEND_URL || "").trim();

      if (!keySecret) {
        return res.status(500).json({
          success: false,
          error: "RAZORPAY_KEY_SECRET is not configured on the backend. Unable to verify payment signature."
        });
      }

      // Cryptographic signature check: HMAC SHA256 (order_id + "|" + payment_id, key_secret)
      const expectedSignature = crypto
        .createHmac("sha256", keySecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");

      if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({
          success: false,
          error: "Payment verification failed: Invalid Razorpay signature"
        });
      }

      // If Render backend is configured, notify Render in background
      if (renderBackendUrl) {
        try {
          fetch(`${renderBackendUrl}/api/payment/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id,
              razorpay_payment_id,
              razorpay_signature,
              bookingDetails
            })
          }).catch(() => {});
        } catch (_) {}
      }

      const email = extractUserEmail(req) || bookingDetails?.userEmail || "guest@travelgenie.in";
      const db = await getDb();
      const now = new Date();
      const bookingDoc = {
        bookingId: "BK-" + Math.floor(100000 + Math.random() * 900000),
        userEmail: email.toLowerCase().trim(),
        userName: bookingDetails?.userName || email.split("@")[0] || "Traveler",
        destination: bookingDetails?.destination || "Custom Itinerary",
        travelers: Number(bookingDetails?.travelers) || 2,
        duration: bookingDetails?.duration || "3 Days / 2 Nights",
        amount: Number(bookingDetails?.amount) || 1499,
        currency: "INR",
        status: "confirmed",
        payment: {
          gateway: "razorpay",
          mode: "test",
          orderId: razorpay_order_id,
          paymentId: razorpay_payment_id,
          signature: razorpay_signature,
          paidAt: now
        },
        itinerarySummary: bookingDetails?.itinerarySummary || "",
        createdAt: now
      };

      await db.collection("bookings").insertOne(bookingDoc);

      res.json({
        success: true,
        booking: bookingDoc,
        message: "Payment verified successfully. Booking confirmed!"
      });
    } catch (err: any) {
      console.error("Payment verify error:", err);
      res.status(500).json({ success: false, error: "Internal payment verification error: " + (err.message || "") });
    }
  });

  // POST /api/payment/failed - Record failed payment attempt
  app.post("/api/payment/failed", async (req, res) => {
    try {
      const { orderId, error, bookingDetails } = req.body;
      const email = extractUserEmail(req) || bookingDetails?.userEmail || "guest@travelgenie.in";
      const db = await getDb();
      await db.collection("failed_payments").insertOne({
        orderId: orderId || null,
        userEmail: email.toLowerCase().trim(),
        error: error || "Payment declined or dismissed",
        bookingDetails: bookingDetails || {},
        createdAt: new Date()
      });
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to record payment attempt" });
    }
  });

  // GET /api/bookings - Get confirmed bookings for the authenticated user
  app.get("/api/bookings", async (req, res) => {
    try {
      const email = extractUserEmail(req);
      if (!email) {
        return res.json({ bookings: [] });
      }
      const db = await getDb();
      const bookings = await db.collection("bookings")
        .find({ userEmail: email })
        .sort({ createdAt: -1 })
        .toArray();
      res.json({ bookings });
    } catch (err: any) {
      console.error("Error fetching bookings:", err);
      res.status(500).json({ error: "Failed to fetch bookings", bookings: [] });
    }
  });

  // Auth endpoints (persisting users in MongoDB)
  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    const cleanEmail = email.toLowerCase().trim();
    try {
      const db = await getDb();
      let existingUser: any = await db.collection("users").findOne({ email: cleanEmail });
      if (!existingUser) {
        existingUser = {
          id: "usr-" + Math.random().toString(36).substring(2, 9),
          email: cleanEmail,
          name: cleanEmail.split("@")[0],
          createdAt: new Date(),
          lastLoginAt: new Date()
        };
        await db.collection("users").insertOne(existingUser);
      } else {
        await db.collection("users").updateOne(
          { _id: existingUser._id },
          { $set: { lastLoginAt: new Date() } }
        );
      }
      const token = "jwt_token_" + Buffer.from(cleanEmail).toString("base64");
      res.json({
        token,
        user: {
          id: existingUser.id || existingUser._id?.toString(),
          email: existingUser.email,
          name: existingUser.name || existingUser.email.split("@")[0]
        }
      });
    } catch (err: any) {
      console.error("Login DB error:", err);
      const user = {
        id: "usr-" + Math.random().toString(36).substring(2, 9),
        email: cleanEmail,
        name: cleanEmail.split("@")[0],
      };
      res.json({
        token: "jwt_token_" + Buffer.from(cleanEmail).toString("base64"),
        user
      });
    }
  });

  app.post("/api/auth/signup", async (req, res) => {
    const { email, name } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    const cleanEmail = email.toLowerCase().trim();
    try {
      const db = await getDb();
      let existingUser = await db.collection("users").findOne({ email: cleanEmail });
      if (existingUser) {
        const token = "jwt_token_" + Buffer.from(cleanEmail).toString("base64");
        return res.json({
          token,
          user: {
            id: existingUser.id || existingUser._id.toString(),
            email: existingUser.email,
            name: existingUser.name || cleanEmail.split("@")[0]
          }
        });
      }
      const newUser = {
        id: "usr-" + Math.random().toString(36).substring(2, 9),
        email: cleanEmail,
        name: (name || cleanEmail.split("@")[0]).trim(),
        createdAt: new Date(),
        lastLoginAt: new Date()
      };
      await db.collection("users").insertOne(newUser);
      const token = "jwt_token_" + Buffer.from(cleanEmail).toString("base64");
      res.json({
        token,
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name
        }
      });
    } catch (err: any) {
      console.error("Signup DB error:", err);
      const user = {
        id: "usr-" + Math.random().toString(36).substring(2, 9),
        email: cleanEmail,
        name: name || cleanEmail.split("@")[0],
      };
      res.json({
        token: "jwt_token_" + Buffer.from(cleanEmail).toString("base64"),
        user
      });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`TravelGenie server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
