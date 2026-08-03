import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow Vercel Hobby functions to run up to 60s (hard limit).
  // Keep individual API route calls well under this — the itinerary route
  // is the most at-risk. If generation approaches 55s, switch to streaming.
  experimental: {
    // serverActionsBodySizeLimit: "2mb" // enable if itinerary JSON gets large
  },
};

export default nextConfig;
