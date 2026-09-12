-- ─────────────────────────────────────────────────────────────────────────────
-- Travel Genie Database Schema (Supabase / Postgres)
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. DESTINATIONS TABLE (Seeded with 22 major Indian cities)
CREATE TABLE IF NOT EXISTS public.destinations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(150) NOT NULL,
  state VARCHAR(100) NOT NULL,
  region VARCHAR(100) NOT NULL,
  popular_for TEXT,
  description TEXT,
  hero_image TEXT,
  rating NUMERIC(3,2) DEFAULT 4.5,
  review_count INT DEFAULT 500,
  starting_price_inr INT DEFAULT 10000,
  best_time_to_visit VARCHAR(100),
  experiences TEXT[],
  general_safety_score NUMERIC(3,2) DEFAULT 4.5,
  girls_trip_safety_score NUMERIC(3,2) DEFAULT 4.4,
  safety_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. SAFETY ADVISORIES TABLE
CREATE TABLE IF NOT EXISTS public.safety_advisories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  destination VARCHAR(150) NOT NULL UNIQUE,
  general_safety_score NUMERIC(3,2) NOT NULL DEFAULT 4.5,
  girls_trip_safety_score NUMERIC(3,2) NOT NULL DEFAULT 4.4,
  source_note TEXT DEFAULT 'General guidance only, not a guarantee — always verify current conditions.',
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. ROUTES TABLE (Transports between cities)
CREATE TABLE IF NOT EXISTS public.routes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source_city VARCHAR(150) NOT NULL,
  destination_city VARCHAR(150) NOT NULL,
  mode_of_transport VARCHAR(50) NOT NULL, -- Flight, Train, Bus, Car/Cab
  avg_duration VARCHAR(50),
  avg_cost INT NOT NULL,
  departure_time VARCHAR(20),
  arrival_time VARCHAR(20),
  train_flight_number VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. ACCOMMODATIONS TABLE
CREATE TABLE IF NOT EXISTS public.accommodations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  destination VARCHAR(150) NOT NULL,
  name VARCHAR(200) NOT NULL,
  type VARCHAR(50) DEFAULT 'Hotel', -- Hotel, Resort, Homestay, Hostel
  price_per_night INT NOT NULL,
  star_rating INT DEFAULT 4,
  amenities TEXT[],
  room_availability VARCHAR(50) DEFAULT 'estimated availability',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. USERS TABLE (Linked to Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. ITINERARIES TABLE (Saved trip plans)
CREATE TABLE IF NOT EXISTS public.itineraries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  source VARCHAR(150),
  destination VARCHAR(150) NOT NULL,
  travel_dates VARCHAR(100),
  num_travellers INT DEFAULT 1,
  budget_inr INT,
  generated_plan_json JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safety_advisories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accommodations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itineraries ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public read destinations" ON public.destinations FOR SELECT USING (true);
CREATE POLICY "Public read safety_advisories" ON public.safety_advisories FOR SELECT USING (true);
CREATE POLICY "Public read routes" ON public.routes FOR SELECT USING (true);
CREATE POLICY "Public read accommodations" ON public.accommodations FOR SELECT USING (true);
CREATE POLICY "Public read itineraries" ON public.itineraries FOR SELECT USING (true);
