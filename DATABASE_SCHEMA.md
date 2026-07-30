# Database Schema

TravelGenie utilizes Supabase PostgreSQL. This document outlines the Entity-Relationship structure.

## ER Diagram

```mermaid
erDiagram
    USERS {
        uuid id PK
        string email
        string full_name
        timestamp created_at
    }
    ITINERARIES {
        uuid id PK
        uuid user_id FK
        string destination
        date start_date
        date end_date
        string budget_level
        timestamp created_at
    }
    ITINERARY_VERSIONS {
        uuid id PK
        uuid itinerary_id FK
        int version_number
        jsonb data_payload
        timestamp created_at
    }
    BOOKINGS {
        uuid id PK
        uuid itinerary_id FK
        string flight_id
        string hotel_id
        float total_cost
        string status
        timestamp created_at
    }

    USERS ||--o{ ITINERARIES : creates
    ITINERARIES ||--|{ ITINERARY_VERSIONS : has
    ITINERARIES ||--o| BOOKINGS : results_in
```

## Tables Details

### `users`
Managed primarily by Supabase Auth, but extended here for profile data.
- `id`: UUID (Primary Key)
- `email`: VARCHAR
- `full_name`: VARCHAR

### `itineraries`
The parent object for a trip.
- `id`: UUID (Primary Key)
- `user_id`: UUID (Foreign Key to users)
- `destination`: VARCHAR
- `budget_level`: VARCHAR (e.g., 'Low', 'Medium', 'High')

### `itinerary_versions`
Stores the actual JSON payload of the trip. The chatbot appends new versions here.
- `id`: UUID (Primary Key)
- `itinerary_id`: UUID (Foreign Key)
- `version_number`: INT (Increments for every chatbot modification)
- `data_payload`: JSONB (The structured days, activities, and metadata)

### `bookings`
Stores the final booked states.
- `status`: VARCHAR ('PENDING', 'CONFIRMED', 'FAILED_FLIGHT', 'FAILED_HOTEL')
