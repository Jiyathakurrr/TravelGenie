# System Architecture

This document describes the high-level architecture and system flow for TravelGenie.

## High-Level Architecture

TravelGenie follows a decoupled Client-Server architecture with a Next.js frontend and an Express.js backend powered by MongoDB Atlas and Cloudinary.

```mermaid
graph TD
    subgraph Frontend
        A[Next.js App Router]
        B[Tailwind UI Components]
        C[State Management]
    end

    subgraph Backend
        D[Express.js Server]
        E[AI Service Controller - Groq / Kimi]
        F[Booking Engine]
    end

    subgraph Database & Storage
        G[(MongoDB Atlas)]
        H[Cloudinary Media CDN]
    end

    A <-->|REST API / JSON| D
    D <-->|Mongoose ODM| G
    D <-->|Image / Media Uploads| H
    D <-->|Prompts & Generation| E
```

## Data Layer Architecture (MongoDB + Cloudinary)

```mermaid
graph LR
    subgraph MongoDB Collections
        C1[destination_catalog]
        C2[attractions]
        C3[accommodations]
        C4[pilgrimage_sites]
        C5[transport_routes]
        C6[itinerary_templates]
    end

    subgraph Media Management
        CL[Cloudinary CDN]
    end

    C1 -. Image Public IDs .-> CL
    C2 -. Image Public IDs .-> CL
    C3 -. Image Public IDs .-> CL
```

## System Flow: Trip Generation

The following diagram illustrates the flow when a user requests a new itinerary.

```mermaid
sequenceDiagram
    participant User
    participant NextJS as Frontend (Next.js)
    participant Express as Backend (Express)
    participant AI as AI Engine (Groq/OpenAI)
    participant DB as MongoDB Atlas

    User->>NextJS: Submit Destination, Dates, Budget
    NextJS->>Express: POST /api/itinerary/generate
    Express->>AI: Send system prompt + user parameters
    AI-->>Express: Return structured JSON itinerary
    Express->>DB: Save new SavedTrip / Itinerary document
    DB-->>Express: Return SavedTrip Document ID
    Express-->>NextJS: Return Success & Data
    NextJS-->>User: Display Interactive Itinerary
```

## System Flow: Chatbot Modification

```mermaid
sequenceDiagram
    participant User
    participant Chatbot as Frontend Chat UI
    participant Express as Backend
    participant AI as AI Engine (Groq/OpenAI)
    participant DB as MongoDB Atlas

    User->>Chatbot: "Change day 2 morning to a museum"
    Chatbot->>Express: POST /api/chatbot/message (Context: Active Itinerary)
    Express->>AI: Analyze intent and generate JSON patch
    AI-->>Express: Return JSON Patch operations
    Express->>DB: Update Conversation & SavedTrip document
    DB-->>Express: Confirm update
    Express-->>Chatbot: Return updated itinerary & AI text response
    Chatbot-->>User: "I've updated day 2! Here is the new plan."
```
