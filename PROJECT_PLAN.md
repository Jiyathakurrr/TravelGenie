# Project Plan & Sprint Schedule

## Weekly Timeline

| Week | Phase | Focus Area | Deliverables |
| :--- | :--- | :--- | :--- |
| 1-2 | **Planning** | Setup, Requirements, Architecture | Repo, Docs, Architecture Diagrams |
| 3-4 | **Backend Base** | Supabase, Express setup | Auth, DB Schema, Endpoints |
| 5-6 | **Frontend Base** | Next.js setup, Trip Engine UI | UI Components, Mock data integration |
| 7-8 | **AI Integration** | OpenAI connection, Prompts | AI Itinerary generation |
| 9-10| **Chatbot** | Conversational UI, Intent parsing | Working Chatbot patching DB |
| 11 | **Booking** | Booking UI, Inline errors | Complete Booking flow |
| 12-13| **Testing** | E2E, Unit, Bug fixing | Test Reports, Stable Build |
| 14 | **Deployment** | CI/CD, Vercel, Render | Live Application URL |
| 15 | **Review** | Presentation Prep | Slide Deck, Final Code Freeze |

## Sprint Plan

We operate on 2-week sprints.

### Sprint 1: Setup & Design
- **Goal:** Get all boilerplate, docs, and designs ready.
- **Prachi:** Finalize user stories, market research.
- **Hitanshi:** Repo setup, DB schema design, CI/CD skeleton.
- **Jiya:** Component library setup in Next.js.

### Sprint 2: Core Infrastructure
- **Goal:** Functional backend and frontend shell.
- **Prachi:** Sprint review, documentation updates.
- **Hitanshi:** Deploy DB, create base Express app.
- **Jiya:** API integration for Auth, base pages UI.

*(Sprints 3-7 will follow the Weekly Timeline above)*

## Risk Analysis

| Risk | Impact | Likelihood | Mitigation Strategy |
| :--- | :--- | :--- | :--- |
| OpenAI API Rate Limits | High | Medium | Implement caching; use fallback static itineraries for demos if needed. |
| Third-Party API Costs | Medium| High | Use local Mock JSON files for the MVP budget comparison module. |
| Scope Creep | High | High | Strict adherence to the MVP features defined in requirements. Prachi to enforce sprint goals. |
| Chatbot Hallucinations | High | Medium | Use strict system prompts and validate all JSON patches before database writes. |
| Deployment Failures | Medium| Low | Hitanshi to set up staging environments and test CI/CD pipelines early in the process. |
