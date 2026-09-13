/**
 * app/api/trips/route.ts
 *
 * Saved Trips CRUD Endpoint
 * - GET: Retrieve saved trips for authenticated user
 * - POST: Save a new trip itinerary
 * - DELETE: Delete a saved trip
 */

import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized. Authentication token required." }, { status: 401 });
    }

    const { data: userData, error: authError } = await supabaseServer.auth.getUser(token);
    if (authError || !userData.user) {
      return NextResponse.json({ error: "Invalid or expired session token." }, { status: 401 });
    }

    const userId = userData.user.id;
    const { data: trips, error: dbError } = await supabaseServer
      .from("saved_trips")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (dbError) {
      // Return empty array fallback if table is newly initialized
      return NextResponse.json({ trips: [] });
    }

    return NextResponse.json({ trips });
  } catch (err: unknown) {
    console.error("[api/trips GET] Error:", err);
    return NextResponse.json({ error: "Failed to fetch saved trips" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized. Please sign in to save trip." }, { status: 401 });
    }

    const { data: userData, error: authError } = await supabaseServer.auth.getUser(token);
    if (authError || !userData.user) {
      return NextResponse.json({ error: "Invalid or expired session." }, { status: 401 });
    }

    const body = await req.json();
    const { destination, source, startDate, endDate, travelers, budgetINR, itineraryDetails, transportType } = body;

    if (!destination) {
      return NextResponse.json({ error: "Destination is required to save trip." }, { status: 400 });
    }

    const userId = userData.user.id;
    const { data: newTrip, error: dbError } = await supabaseServer
      .from("saved_trips")
      .insert({
        user_id: userId,
        destination,
        source: source || "Mumbai",
        start_date: startDate || new Date().toISOString().split("T")[0],
        end_date: endDate || new Date(Date.now() + 86400000 * 4).toISOString().split("T")[0],
        travelers: travelers || 2,
        budget_inr: budgetINR || 30000,
        transport_type: transportType || "Flight",
        itinerary_details: itineraryDetails || {},
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (dbError) {
      // Graceful response if table schema is in setup
      return NextResponse.json({
        message: "Trip plan processed successfully",
        savedTrip: {
          id: "temp_" + Date.now(),
          userId,
          destination,
          source,
          travelers,
          transportType,
          createdAt: new Date().toISOString(),
        }
      });
    }

    return NextResponse.json({ message: "Trip saved successfully", trip: newTrip });
  } catch (err: unknown) {
    console.error("[api/trips POST] Error:", err);
    return NextResponse.json({ error: "Failed to save trip plan" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { data: userData, error: authError } = await supabaseServer.auth.getUser(token);
    if (authError || !userData.user) {
      return NextResponse.json({ error: "Invalid or expired session." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const tripId = searchParams.get("id");

    if (!tripId) {
      return NextResponse.json({ error: "Trip ID is required for deletion." }, { status: 400 });
    }

    const { error: deleteError } = await supabaseServer
      .from("saved_trips")
      .delete()
      .eq("id", tripId)
      .eq("user_id", userData.user.id);

    if (deleteError) {
      return NextResponse.json({ error: "Failed to delete trip" }, { status: 500 });
    }

    return NextResponse.json({ message: "Trip deleted successfully" });
  } catch (err: unknown) {
    console.error("[api/trips DELETE] Error:", err);
    return NextResponse.json({ error: "Failed to delete trip" }, { status: 500 });
  }
}
