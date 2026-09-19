# Test Plan & Strategy

This document defines the approach for validating the TravelGenie application to ensure high quality and reliability.

## Testing Objectives
- Validate core business logic (Trip Engine, AI Chatbot, Geospatial Lookups).
- Ensure UI responsiveness and accessibility.
- Guarantee robust database integrity and schema validation.

## 1. Unit & Schema Testing
**Scope:** Mongoose schemas, seed data integrity, utility functions, and isolated React components.
**Tools:** Jest / Vitest, custom validator scripts (`npm run validate-data`).
**Strategy:**
- Run automated schema validation scripts to verify referential integrity across MongoDB collections (0 orphan records).
- Test Next.js UI components for correct rendering.
- Test Express.js controller logic in isolation.

## 2. Integration Testing
**Scope:** Interactions between frontend and backend REST endpoints, and backend to MongoDB Atlas.
**Tools:** Supertest (for Express APIs), Vitest.
**Strategy:**
- Test AI API endpoints using fallback models for CI reliability.
- Verify MongoDB CRUD operations for `saved_trips`, `conversations`, and `users`.

## 3. Manual Testing
**Scope:** Exploratory testing of the application from a user's perspective.
**Strategy:**
- Perform cross-browser testing (Chrome, Safari, Firefox) for UI consistency.
- Test responsive layouts on mobile device simulators.
- Verify that the chat interface feels natural and responsive.

## 4. Database Integrity Verification
**Scope:** Ensuring seed generators and live database collections contain zero invalid records, corrupt coordinates, or missing foreign keys.
**Strategy:**
- Execute `npm run validate-data` prior to pushing to `main`.
