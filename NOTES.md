# Project Notes & Hard Constraints

This document clarifies key architectural and integration decisions for Travel Genie, specifically regarding simulated data and zero/low-cost tier limitations.

## 1. AI Integration (Kimi API)
- The project uses **Kimi API** (Moonshot AI) for all AI Chatbot and Itinerary Generation features.
- We utilize the OpenAI npm SDK since Kimi's API is OpenAI-SDK compatible.
- Requires `KIMI_API_KEY` to be set in `.env.local`.

## 2. Mock Data (Flights, Hotels, Trains)
- **Important:** Amadeus self-service APIs were decommissioned on July 17, 2026. Do NOT attempt to integrate it.
- All flight, hotel, and train search queries hit local Mock JSON files inside the repository (e.g. `data/trains.json`).
- If the generated itinerary exceeds the user's budget, the backend flags the overage and suggests train alternatives. **It never auto-swaps the transport mode without explicit user confirmation.**

## 3. Simulated Checkout (Razorpay)
- Simulated checkouts use **Razorpay Test Mode** exclusively.
- There are no real payment gateways or credential scraping features implemented.
- Currency is fixed to **INR**.
- A mock success/cancel screen concludes the booking module. 

## 4. Hosting & Vercel Limitations
- Deployed on **Vercel Hobby tier**.
- **Crucial Limitation:** Vercel Hobby limits serverless execution to 60 seconds.
- Multi-call chains (like Itinerary Generation + Safety + Weather checks) must use streaming or client-side polling to avoid timeout errors.

## 5. Free-Tier External APIs
- Safety/Advisories: `Travel-Advisory.info` (Keyless)
- Weather/Seasonality: `Open-Meteo` (Keyless)
