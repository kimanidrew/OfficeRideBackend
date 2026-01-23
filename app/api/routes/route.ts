// app/api/routes/route.ts
import { prisma } from "../../../lib/prisma";
import { NextResponse } from "next/server";


async function geocode(query: string, apiKey: string) {
  const res = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      query
    )}&key=${apiKey}`
  );
  const data = await res.json();
  if (!data.results?.length) return null;
  const r = data.results[0];
  return {
    name: r.formatted_address as string,
    latitude: r.geometry.location.lat as number,
    longitude: r.geometry.location.lng as number,
  };
}

async function findOrCreateLocation(companyId: string, query: string, apiKey: string) {
  const geo = await geocode(query, apiKey);
  if (!geo) return null;

  const existing = await prisma.location.findFirst({
    where: { companyId, name: geo.name },
  });
  if (existing) return existing;

  return prisma.location.create({
    data: {
      companyId,
      name: geo.name,
      latitude: geo.latitude,
      longitude: geo.longitude,
    },
  });
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY!;
    const body = await req.json();
    const { companyId, adminId, startQuery, viaQueries, endQuery, distance } = body;

    const startLoc = await findOrCreateLocation(companyId, startQuery, apiKey);
    const endLoc = await findOrCreateLocation(companyId, endQuery, apiKey);
    if (!startLoc || !endLoc) {
      return NextResponse.json({ error: "Failed to resolve start or end location" }, { status: 400 });
    }

    const viaLocs: { id: string }[] = [];
    for (const q of viaQueries || []) {
      const loc = await findOrCreateLocation(companyId, q, apiKey);
      if (loc) viaLocs.push({ id: loc.id });
    }

    const route = await prisma.route.create({
      data: {
        companyId,
        adminId,
        startLocationId: startLoc.id,
        endLocationId: endLoc.id,
        distance,
      },
    });

    for (let i = 0; i < viaLocs.length; i++) {
      await prisma.routeStop.create({
        data: {
          routeId: route.id,
          locationId: viaLocs[i].id,
          order: i,
        },
      });
    }

    const full = await prisma.route.findUnique({
      where: { id: route.id },
      include: {
        company: true,
        admin: true,
        startLocation: true,
        endLocation: true,
        stops: { include: { location: true }, orderBy: { order: "asc" } },
      },
    });

    return NextResponse.json(full, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create route" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const routes = await prisma.route.findMany({
      include: {
        company: true,
        admin: true,
        startLocation: true,
        endLocation: true,
        stops: { include: { location: true }, orderBy: { order: "asc" } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(routes, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch routes" }, { status: 500 });
  }
}
