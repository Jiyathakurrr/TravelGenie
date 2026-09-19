# Technology Stack

This document details the technologies chosen for TravelGenie and the rationale behind each choice.

## Frontend
- **Next.js (App Router):** Chosen for its robust routing, Server-Side Rendering (SSR) capabilities, and seamless API route integration, which improves SEO and initial load times.
- **React:** The core UI library.
- **Tailwind CSS:** For rapid, utility-first styling, ensuring a consistent and responsive design system without bloated CSS files.
- **TypeScript:** Enforces type safety across the application, significantly reducing runtime errors and improving developer experience.

## Backend
- **Node.js:** JavaScript runtime environment allowing for a unified language across the stack.
- **Express.js:** Lightweight and flexible web application framework for building robust REST APIs.

## Database & Cloud Media
- **MongoDB Atlas:** Cloud-hosted NoSQL document database providing flexible schema modeling, 2dsphere geospatial indexing, and high scalability for rich travel catalogs and user trip data.
- **Mongoose 8.x:** Object Data Modeling (ODM) library providing schema validation, deterministic IDs, and relationship hooks.
- **Cloudinary CDN:** High-performance media asset hosting and optimization for destination images, attraction photos, and accommodation media.
- **Supabase Auth / JWT:** Authentication for user accounts and trip management.

## Artificial Intelligence
- **Groq Cloud / OpenAI SDK:** Powers the core AI Trip Planning Engine and conversational chatbot with low-latency LLM inference (`openai/gpt-oss-120b` & `llama-3.3-70b-versatile`).

## Deployment & DevOps
- **Vercel:** Optimal hosting platform for Next.js applications, providing edge network delivery and automatic CI/CD on Git push.
- **Render:** Used to host the Express.js backend API, offering easy horizontal scaling and simple deployment flows.
- **GitHub Actions:** Automates the testing pipeline before code is merged into `main`.
