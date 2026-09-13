/**
 * frontend/lib/apiClient.ts
 *
 * Unified API Client for connecting frontend to Render Express backend.
 * Reads NEXT_PUBLIC_API_BASE_URL or VITE_API_BASE_URL dynamically.
 */

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  (typeof window !== "undefined" && (window as unknown as Record<string, string>).VITE_API_BASE_URL) ||
  "http://localhost:5000";

export async function fetchFromBackend(endpoint: string, options: RequestInit = {}) {
  const url = `${BASE_URL.replace(/\/$/, "")}/${endpoint.replace(/^\//, "")}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  // Automatically attach auth token if available in localStorage
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("travelgenie_token");
    if (token && !headers["Authorization"]) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  return response;
}

export { BASE_URL };
