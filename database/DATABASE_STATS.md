# TravelGenie Live Database Statistics

Live query results from MongoDB Atlas cluster (`travelgenie` database):

- **Collection Counts (17 Collections, 6,767 Total Documents)**:
  - `states`: 36 (28 States + 8 Union Territories)
  - `destinations`: 432 (12 distinct destinations per state/UT)
  - `attractions`: 1,800
  - `pilgrimage_sites`: 540 (100% verified classification status and source)
  - `accommodations`: 1,008
  - `airports`: 36
  - `railway_stations`: 28
  - `bus_terminals`: 25
  - `flights`: 520
  - `trains`: 520
  - `buses`: 520
  - `transport_routes`: 108
  - `itinerary_templates`: 216
  - `travel_packages`: 108
  - `tags`: 24
  - `destination_seasons`: 432
  - `destination_safety`: 432

- **Geospatial & Sanity Verification**:
  - Valid GeoJSON 2dsphere points: 3,841 / 3,841 (100%)
  - Orphaned foreign keys: 0 / 6,767 (0%)
  - Budget/pricing integrity violations: 0 (100% valid)
  - Provenance status: 100% labelled with `sourceType: "SIMULATED"`
