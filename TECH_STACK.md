# Technology Stack

This document details the technologies chosen for TravelGenie and the rationale behind each choice.

## Frontend
- **Next.js (App Router):** Chosen for its robust routing, Server-Side Rendering (SSR) capabilities, and seamless API route integration, which improves SEO and initial load times.
- **React:** The core UI library.
- **Tailwind CSS:** For rapid, utility-first styling, ensuring a consistent and responsive design system without bloated CSS files.
- **TypeScript:** Enforces type safety across the application, significantly reducing runtime errors and improving developer experience.

## Backend
- **Node.js:** JavaScript runtime environment allowing for a unified language across the stack.
- **Express.js:** Lightweight and flexible web application framework for building robust REST APIs to handle custom logic not covered by Supabase directly.

## Database & Authentication
- **Supabase PostgreSQL:** An open-source Firebase alternative. Provides a powerful relational database (PostgreSQL) which is essential for complex itinerary relationships.
- **Supabase Auth:** Handles user authentication (Email/Password, OAuth) securely and integrates seamlessly with the PostgreSQL Row Level Security (RLS).

## Artificial Intelligence
- **OpenAI API (GPT-4-turbo):** Powers the core Trip Planning Engine and the AI Chatbot. Chosen for its superior natural language understanding and ability to output structured JSON data for direct database patching.

## Deployment & DevOps
- **Vercel:** Optimal hosting platform for Next.js applications, providing edge network delivery and automatic CI/CD on Git push.
- **Render:** Used to host the Express.js backend API, offering easy horizontal scaling and simple deployment flows.
- **GitHub Actions:** Automates the testing pipeline before code is merged into the `develop` or `main` branches.
