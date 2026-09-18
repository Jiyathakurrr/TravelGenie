# TravelGenie Database Architecture & Reference

## Architecture Overview
- **Database Engine**: MongoDB Atlas (v7+)
- **ODM**: Mongoose 8.x
- **Design Paradigm**: Document model with deterministic, idempotent IDs and GeoJSON-native geospatial indexing.

## Collections & Key Fields
- `states`: `_id` (ISO code e.g. `IN-MH`), `name`, `code`, `type` (`STATE`|`UT`), `region`, `capital`.
- `destination_catalog`: `_id`, `stateId` (ref `states`), `name`, `type`, `location` (GeoJSON Point), `estimatedDailyBudget`, `budgetCategory`.
- `attractions`: `_id`, `destinationId`, `stateId`, `name`, `category`, `entryFee`, `location`, `rating`.
- `pilgrimage_sites`: `_id`, `destinationId`, `stateId`, `religion`, `deity`, `classificationStatus`, `classificationSource`, `location`.
- `accommodations`: `_id`, `destinationId`, `stateId`, `type`, `pricePerNight` (`min`, `max`), `amenities`, `location`.
- `airports`: `_id`, `iataCode`, `name`, `city`, `location`, `stateId`.
- `railway_stations`: `_id`, `stationCode`, `name`, `city`, `location`, `stateId`.
- `bus_terminals`: `_id`, `terminalCode`, `name`, `city`, `location`, `stateId`.
- `flights`: `_id`, `flightNumber`, `originAirportId`, `destinationAirportId`, `fare` (`economy`, `business`), `airline`.
- `trains`: `_id`, `trainNumber`, `originStationId`, `destinationStationId`, `fare` (`sleeper`, `ac3Tier`, `ac2Tier`), `trainName`.
- `buses`: `_id`, `busNumber`, `originTerminalId`, `destinationTerminalId`, `fare` (`seater`, `sleeper`), `operator`.
- `transport_routes`: `_id`, `origin`, `destination`, `mode`, `distanceKm`, `estimatedDurationHours`.
- `itinerary_templates`: `_id`, `destinationId`, `durationDays`, `title`, `estimatedTotalCost`, `dayPlans`.
- `travel_packages`: `_id`, `itineraryTemplateId`, `packageName`, `basePrice`, `inclusions`, `exclusions`.
- `tags`: `_id`, `name`, `category`, `slug`.
- `destination_seasons`: `_id`, `destinationId`, `bestSeason`, `peakMonths`, `monsoonWarning`.
- `destination_safety`: `_id`, `destinationId`, `safetyScore`, `emergencyContacts`, `travelAdvisory`.

## Relationships & Integrity
- Deterministic hierarchical ID patterns (`stateId` -> `destinationId` -> child entities).
- Strict referential integrity verified by automated auditor (0 orphan records).

## Indexes & Geospatial Capabilities
- **2dsphere Indexes**:
  - `accommodations.location`
  - `attractions.location`
  - `pilgrimage_sites.location`
  - `destination_catalog.location`
  - `airports.location`
  - `railway_stations.location`
  - `bus_terminals.location`
- **Compound & Unique Indexes**:
  - Unique keys on `code`, `iataCode`, `stationCode`, `terminalCode`, `flightNumber`, `trainNumber`, `busNumber`.
  - Compound lookups: `{ destinationId: 1, category: 1 }`, `{ stateId: 1, type: 1 }`.

## Geospatial Query Examples
- **Find attractions within 15 km of a coordinate**:
  ```javascript
  const attractions = await Attraction.find({
    location: {
      $near: {
        $geometry: { type: "Point", coordinates: [72.8777, 19.0760] },
        $maxDistance: 15000
      }
    }
  });
  ```
- **Find accommodations in geographic bounding box**:
  ```javascript
  const hotels = await Accommodation.find({
    location: {
      $geoWithin: {
        $box: [[72.75, 18.90], [73.05, 19.30]]
      }
    }
  });
  ```

## Seed & Validation Commands
- Run seed: `npm run seed`
- Run integrity & secret validation: `npm run validate-data`
- Scoped reset of simulated records: `npm run seed:reset`

## Environment Variables
- `MONGODB_URI`: MongoDB Atlas cluster connection string.
- `MONGODB_DB_NAME`: Database target name (`travelgenie`).
- `CLOUDINARY_CLOUD_NAME`: Cloudinary cloud identifier for media assets.
- `CLOUDINARY_API_KEY`: Cloudinary public API key.
- `CLOUDINARY_API_SECRET`: Cloudinary API secret.

## Cloudinary Integration
- Media assets are modeled as schema metadata (`url`, `publicId`, `altText`, `type`).
- Seeding utilizes valid Cloudinary format placeholders.
- Real asset uploads are handled via backend upload controllers decoupled from seed logic.

## Provenance Tracking
- Every document includes:
  ```json
  "provenance": {
    "sourceType": "SIMULATED",
    "sourceName": "TravelGenie Seed Generator v1.0",
    "dataVersion": "1.0.0",
    "lastVerifiedAt": "2026-09-17T00:00:00.000Z"
  }
  ```
- Distinguishes synthetic mock data from verified production integrations.

## Extending with Live Data
- Set `provenance.sourceType = "VERIFIED"` or `"LIVE_API"` when integrating third-party APIs (Amadeus, Google Places, IRCTC).
- `npm run seed:reset` only deletes documents matching `provenance.sourceType: "SIMULATED"`, safely preserving live and user-created data.
