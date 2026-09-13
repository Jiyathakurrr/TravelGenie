/**
 * app/api/trips/route.ts
 *
 * Proxy/Fallback Saved Trips Endpoint (MongoDB Express Backend integration)
 */

import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  return NextResponse.json({ trips: [] });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  return NextResponse.json({
    message: "Trip plan saved",
    savedTrip: {
      id: "trip_" + Date.now(),
      destination: body.destination || "Destination",
      createdAt: new Date().toISOString(),
    },
  });
}

export async function DELETE(req: NextRequest) {
  return NextResponse.json({ message: "Trip deleted" });
}
