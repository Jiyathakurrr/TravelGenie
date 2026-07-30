# System Architecture

This document describes the high-level architecture and system flow for TravelGenie.

## High-Level Architecture

TravelGenie follows a standard decoupled Client-Server architecture utilizing a modern serverless approach where possible.

```mermaid
graph TD
    subgraph Frontend
        A[Next.js App Router]
        B[Tailwind UI Components]
        C[State Management]
    end

    subgraph Backend
        D[Express.js Server]
        E[AI Service Controller]
        F[Booking Engine]
    end

    subgraph External Services
        G[(Supabase PostgreSQL)]
        H[Supabase Auth]
        I[OpenAI API]
    end

    A <-->|REST API / JSON| D
    A <-->|Auth Tokens| H
    D <-->|SQL Queries| G
    D <-->|Prompts & Patches| I
```

## System Flow: Trip Generation

The following diagram illustrates the flow when a user requests a new itinerary.

```mermaid
sequenceDiagram
    participant User
    participant NextJS as Frontend (Next.js)
    participant Express as Backend (Express)
    participant OpenAI
    participant DB as Supabase DB

    User->>NextJS: Submit Destination, Dates, Budget
    NextJS->>Express: POST /api/itinerary/generate
    Express->>OpenAI: Send system prompt + user parameters
    OpenAI-->>Express: Return structured JSON itinerary
    Express->>DB: Save new Itinerary & Version 1
    DB-->>Express: Return Itinerary ID
    Express-->>NextJS: Return Success & Data
    NextJS-->>User: Display Interactive Itinerary
```

## System Flow: Chatbot Modification

```mermaid
sequenceDiagram
    participant User
    participant Chatbot as Frontend Chat UI
    participant Express as Backend
    participant OpenAI
    participant DB as Supabase DB

    User->>Chatbot: "Change day 2 morning to a museum"
    Chatbot->>Express: POST /api/chatbot/message (Context: Current Itinerary)
    Express->>OpenAI: Analyze intent and generate DB patch
    OpenAI-->>Express: Return JSON Patch operations
    Express->>DB: Apply patch, save as Version N+1
    DB-->>Express: Confirm save
    Express-->>Chatbot: Return updated itinerary & AI text response
    Chatbot-->>User: "I've updated day 2! Here is the new plan."
```
