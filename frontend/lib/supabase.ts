/**
 * lib/supabase.ts
 * Supabase client helpers (browser and server).
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder-project.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "placeholder-anon-key";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "placeholder-service-key";

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.warn("[supabase] NEXT_PUBLIC_SUPABASE_URL missing. Using fallback placeholder.");
}

/** Browser client for client components */
export const supabaseBrowser = createClient(supabaseUrl, supabaseAnonKey);

/** Server client with service role for administrative database operations */
export const supabaseServer = createClient(supabaseUrl, supabaseServiceKey);
