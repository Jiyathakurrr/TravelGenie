# Project Requirements

This document defines the functional and non-functional requirements for the TravelGenie MVP.

## 1. Trip Planning Engine

The core module responsible for initial itinerary creation.

**Inputs Accepted:**
- Destination (City, Country)
- Travel Dates (Start Date, End Date)
- Budget (Low, Medium, High, or specific currency amount)
- Preferences (e.g., Adventure, Relaxation, Cultural, Food)

**Outputs:**
- AI-generated day-by-day itinerary.
- Recommended activities, meal suggestions, and local transit tips.

## 2. Budget Comparison Module

Responsible for analyzing costs and ranking options.

**Functionality:**
- Compares Flights, Hotels, and grouped Packages.
- Ranks options from most budget-friendly to premium based on user input.
- **Constraint:** For the MVP, this module MUST use local mock JSON files (`flights.json`, `hotels.json`). No real APIs will be consumed to prevent cost overruns during testing.

## 3. AI Chatbot

A conversational interface for itinerary management.

**Functionality:**
- **Context Awareness:** The chatbot must read the current active itinerary.
- **Conversational Modifications:** Users can type natural language (e.g., "Swap the museum tour on day 2 for a beach day").
- **Database Patching:** The chatbot translates text into structured patches and updates the itinerary in the database directly.
- **Versioning:** Every modification creates a new version of the itinerary, allowing users to undo changes or view history.

## 4. Booking Module

Handles the finalization of the trip.

**Functionality:**
- Allows users to select and "book" their chosen flights and hotels.
- **Resilience:** Gracefully handles simulated real-world issues:
  - Price changes between selection and booking.
  - Unavailable hotels.
  - Unavailable flights.
- **UX Requirement:** Must show inline error messages (e.g., "This flight is no longer available, please select an alternative") instead of redirecting the user to a generic error page.
