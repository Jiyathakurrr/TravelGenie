# Test Plan & Strategy

This document defines the approach for validating the TravelGenie application to ensure high quality and reliability.

## Testing Objectives
- Validate core business logic (Trip Engine, Chatbot).
- Ensure UI responsiveness and accessibility.
- Guarantee robust error handling, especially in the Booking Module.

## 1. Unit Testing
**Scope:** Individual functions, utilities, and isolated React components.
**Tools:** Jest, React Testing Library.
**Strategy:**
- Test all AI parser utility functions (e.g., ensuring OpenAI JSON strings are correctly parsed into objects).
- Test Next.js UI components for correct rendering with mock props.
- Test Express.js controller logic in isolation.

## 2. Integration Testing
**Scope:** Interactions between the frontend and backend, and backend to the database.
**Tools:** Supertest (for Express APIs), Jest.
**Strategy:**
- Mock the OpenAI API response to prevent costs during CI/CD.
- Use a dedicated Supabase testing environment/schema to test database inserts and RLS policies.
- Ensure the Chatbot endpoint successfully patches an itinerary in the database.

## 3. Manual Testing
**Scope:** Exploratory testing of the application from a user's perspective.
**Strategy:**
- Jiya will perform cross-browser testing (Chrome, Safari, Firefox) for UI consistency.
- Test responsive layouts on mobile device simulators.
- Verify that the chat interface feels natural and responsive.

## 4. Regression Testing
**Scope:** Ensuring new code does not break existing features.
**Strategy:**
- Automated via GitHub Actions on every Pull Request.
- All Unit and Integration tests must pass before a merge to `develop` is allowed.

## 5. Acceptance Testing
**Scope:** Validating that the product meets the business requirements defined in `REQUIREMENTS.md`.
**Strategy:**
- Prachi (Product Manager) will conduct User Acceptance Testing (UAT) at the end of each sprint.
- Focus on the "Happy Path": generating a trip, modifying it via chat, and reaching the booking confirmation screen.

## 6. Bug Reporting
When a bug is found, it must be documented using the GitHub Issue **Bug Report** template.
**Required fields:**
- Steps to reproduce
- Expected vs. Actual behavior
- Screenshots/Screen recordings
- Environment details (Browser, OS)
