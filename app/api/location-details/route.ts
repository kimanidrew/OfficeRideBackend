import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const placeId = searchParams.get("placeId");
  if (!placeId) return NextResponse.json({});

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!;
  const res = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?place_id=${placeId}&key=${apiKey}`
  );
  const data = await res.json();

  if (!data.results?.length) return NextResponse.json({});

  const r = data.results[0];
  return NextResponse.json({
    name: r.formatted_address,
    latitude: r.geometry.location.lat,
    longitude: r.geometry.location.lng,
  });
}
