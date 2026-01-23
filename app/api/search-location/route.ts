import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");
  if (!query) return NextResponse.json({ results: [] });

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!;
  const res = await fetch(
    `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
      query
    )}&key=${apiKey}`
  );
  const data = await res.json();

  // return simplified results
  const results = (data.predictions || []).map((p: any) => ({
    description: p.description,
    placeId: p.place_id,
  }));

  return NextResponse.json({ results });
}
