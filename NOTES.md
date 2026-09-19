# Project Notes & Hard Constraints

This document clarifies key architectural decisions and integration guidelines for Travel Genie.

## 1. AI Integration (Groq & OpenAI SDK)
- The project uses **Groq Cloud AI** with OpenAI SDK compatibility for fast LLM inference (`openai/gpt-oss-120b` primary model, `llama-3.3-70b-versatile` fallback).
- Requires `GROQ_API_KEY` to be configured on the server environment (Render backend).

## 2. Database Engine (MongoDB Atlas)
- Uses **MongoDB Atlas v7+** with **Mongoose 8.x ODM**.
- Schemas feature 2dsphere geospatial indexing for geographic queries (`$near`, `$geoWithin`).
- Database configuration is managed in `backend/config/db.js` and `database/models/index.js`.

## 3. Media Storage (Cloudinary)
- Media assets for destinations, attractions, and accommodations are managed via **Cloudinary CDN**.
- Image metadata structures store `url`, `publicId`, `altText`, and `type`.
- Configured in `backend/config/cloudinary.js`.

## 4. Simulated Checkout (Razorpay)
- Checkouts use **Razorpay Test Mode** (`rzp_test_*`).
- Currency is fixed to **INR**.
- Key configurations in `backend/config/razorpay.js`.

## 5. Deployment Architecture
- **Frontend:** Next.js hosted on Vercel Edge Network.
- **Backend:** Express.js REST API hosted on Render.
