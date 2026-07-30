# API Documentation

This document outlines the core RESTful endpoints exposed by the Express.js backend.

*Note: All endpoints require a valid Supabase JWT Bearer token in the `Authorization` header.*

## Itinerary Endpoints

### Generate Itinerary
- **URL:** `/api/itineraries/generate`
- **Method:** `POST`
- **Body:**
  ```json
  {
    "destination": "Paris, France",
    "startDate": "2024-05-01",
    "endDate": "2024-05-07",
    "budget": "Medium",
    "preferences": ["Art", "Food"]
  }
  ```
- **Response (200 OK):** Returns the generated itinerary object and its initial version ID.

### Get User Itineraries
- **URL:** `/api/itineraries`
- **Method:** `GET`
- **Response (200 OK):** Returns an array of itineraries belonging to the authenticated user.

## Chatbot Endpoints

### Chatbot Message (Modify Itinerary)
- **URL:** `/api/chatbot/message`
- **Method:** `POST`
- **Body:**
  ```json
  {
    "itineraryId": "uuid-here",
    "message": "Change dinner on day 1 to Italian food."
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "aiResponse": "I have updated your dinner on day 1 to a highly-rated Italian restaurant.",
    "newVersionId": "uuid-here",
    "updatedPayload": { ... }
  }
  ```

## Booking Endpoints

### Create Booking
- **URL:** `/api/bookings`
- **Method:** `POST`
- **Body:**
  ```json
  {
    "itineraryId": "uuid-here",
    "flightSelectionId": "mock-flight-123",
    "hotelSelectionId": "mock-hotel-456"
  }
  ```
- **Response (200 OK / 400 Bad Request):**
  - Success returns booking confirmation.
  - Failure returns inline error data (e.g., `{"error": "PRICE_CHANGED", "message": "The flight price has increased."}`).
