// app/api/routes/route.ts
export const runtime = "nodejs";

import { prisma } from "../../../lib/prisma";
import { NextResponse } from "next/server";

/* =========================
   DISTANCE CALCULATION
========================= */
async function calculateDistance(
  start: { latitude: number; longitude: number },
  end: { latitude: number; longitude: number },
  via: { latitude: number; longitude: number }[],
  apiKey: string
): Promise<number> {
  try {
    const waypoints = via.length
      ? `&waypoints=${via.map(v => `${v.latitude},${v.longitude}`).join("|")}`
      : "";

    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${start.latitude},${start.longitude}&destination=${end.latitude},${end.longitude}${waypoints}&key=${apiKey}`;

    const res = await fetch(url);
    const data = await res.json();

    if (data.status !== "OK" || !data.routes?.length) {
      console.error("Google Directions failed:", data);
      return 0;
    }

    return (
      data.routes[0].legs.reduce(
        (sum: number, leg: any) => sum + leg.distance.value,
        0
      ) / 1000
    );
  } catch (err) {
    console.error("Distance calculation error:", err);
    return 0;
  }
}

/* =========================
   LOCATION HELPERS
========================= */
function normalizeAddress(name: string): string {
  if (name.includes("QV7F+QR2")) return "Garden City Business Park";
  return name;
}

async function findOrCreateLocation(
  companyId: string,
  loc: {
    name: string;
    latitude: number;
    longitude: number;
    type?: "office" | "custom";
  }
) {
  const name = normalizeAddress(loc.name);

  const existing = await prisma.location.findFirst({
    where: { companyId, name },
  });

  if (existing) return existing;

  return prisma.location.create({
    data: {
      companyId,
      name,
      latitude: loc.latitude,
      longitude: loc.longitude,
      type: loc.type ?? "custom",
    },
  });
}

/* =========================
   POST – CREATE ROUTE
========================= */
export async function POST(req: Request) {
  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) throw new Error("Missing GOOGLE_MAPS_API_KEY");

    const { companyId, adminId, start, end, via = [] } = await req.json();

    if (!companyId || !adminId || !start || !end) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const startLoc = await findOrCreateLocation(companyId, start);
    const endLoc = await findOrCreateLocation(companyId, end);

    const viaLocs = [];
    for (const v of via) {
      const loc = await findOrCreateLocation(companyId, v);
      viaLocs.push(loc);
    }

    const distance = await calculateDistance(
      startLoc,
      endLoc,
      viaLocs.map(v => ({ latitude: v.latitude, longitude: v.longitude })),
      apiKey
    );

    const route = await prisma.route.create({
      data: {
        companyId,
        adminId,
        startLocationId: startLoc.id,
        endLocationId: endLoc.id,
        distance,
      },
    });

    await prisma.routeStop.createMany({
      data: viaLocs.map((v, i) => ({
        routeId: route.id,
        locationId: v.id,
        order: i,
      })),
    });

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

    return NextResponse.json(full, { status: 201 });
  } catch (err) {
    console.error("POST /routes failed:", err);
    return NextResponse.json(
      { error: "Failed to create route" },
      { status: 500 }
    );
  }
}

/* =========================
   GET – FETCH ROUTES
========================= */
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

    return NextResponse.json(routes);
  } catch (err) {
    console.error("GET failed:", err);
    return NextResponse.json(
      { error: "Failed to fetch routes" },
      { status: 500 }
    );
  }
}

/* =========================
   PUT – EDIT ROUTE
========================= */
export async function PUT(req: Request) {
  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY!;
    const { routeId, start, end, via = [] } = await req.json();

    const route = await prisma.route.findUnique({ where: { id: routeId } });
    if (!route) return NextResponse.json({ error: "Route not found" }, { status: 404 });

    const startLoc = await findOrCreateLocation(route.companyId, start);
    const endLoc = await findOrCreateLocation(route.companyId, end);

    const viaLocs = [];
    for (const v of via) {
      viaLocs.push(await findOrCreateLocation(route.companyId, v));
    }

    const distance = await calculateDistance(
      startLoc,
      endLoc,
      viaLocs.map(v => ({ latitude: v.latitude, longitude: v.longitude })),
      apiKey
    );

    await prisma.route.update({
      where: { id: routeId },
      data: {
        startLocationId: startLoc.id,
        endLocationId: endLoc.id,
        distance,
      },
    });

    await prisma.routeStop.deleteMany({ where: { routeId } });
    await prisma.routeStop.createMany({
      data: viaLocs.map((v, i) => ({
        routeId,
        locationId: v.id,
        order: i,
      })),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PUT failed:", err);
    return NextResponse.json(
      { error: "Failed to update route" },
      { status: 500 }
    );
  }
}
