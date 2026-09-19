# Project Requirements

This document defines the functional and non-functional requirements for TravelGenie.

## 1. Trip Planning Engine

The core module responsible for initial itinerary creation.

**Inputs Accepted:**
- Destination (City, State/Region)
- Travel Dates (Start Date, End Date)
- Budget (Low, Medium, High, or specific currency amount in INR)
- Transport Mode (Flight, Train, Bus, Self-Drive)
- Preferences (e.g., Heritage & Pilgrimage, Nature & Wildlife, Beach, Adventure, Culinary)

**Outputs:**
- AI-generated day-by-day itinerary.
- Recommended activities, meal suggestions, and local transit tips.
- Real-time geospatial matching against MongoDB destination catalog.

## 2. Budget & Transport Comparison Module

Responsible for analyzing costs and ranking options.

**Functionality:**
- Compares Flights, Trains, Buses, Hotels, and grouped Travel Packages.
- Ranks options from budget-friendly to luxury based on user input.
- Leverages MongoDB transport and accommodation models with Cloudinary media integration.

## 3. AI Chatbot

A conversational interface for itinerary management.

**Functionality:**
- **Context Awareness:** The chatbot reads the active trip context and message history.
- **Conversational Modifications:** Users can type natural language (e.g., "Swap the afternoon activity for a museum").
- **Database Synchronization:** Saves conversations and updated itineraries to MongoDB (`conversations` and `saved_trips` collections).

## 4. Booking & Payment Module

Handles trip finalization and checkout.

**Functionality:**
- Allows users to select and "book" chosen flights, hotels, and packages.
- **Simulated Payment:** Powered by Razorpay Test Mode integration.
- **UX Requirement:** Clear inline feedback for pricing updates and booking confirmation.
