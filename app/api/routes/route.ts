// app/api/routes/route.ts
import { prisma } from "../../../lib/prisma";
import { NextResponse } from "next/server";

// -----------------------------
// Helper: calculate distance using Google Directions API
// -----------------------------
async function calculateDistance(
  start: { latitude: number; longitude: number },
  end: { latitude: number; longitude: number },
  via: { latitude: number; longitude: number }[],
  apiKey: string
): Promise<number> {
  const waypoints = via.map(v => `${v.latitude},${v.longitude}`).join("|");
  const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${start.latitude},${start.longitude}&destination=${end.latitude},${end.longitude}&key=${apiKey}${waypoints ? `&waypoints=${waypoints}` : ""}`;

  const res = await fetch(url);
  const data = await res.json();

  if (!data.routes?.length) return 0;
  const meters = data.routes[0].legs.reduce(
    (sum: number, leg: any) => sum + leg.distance.value,
    0
  );
  return meters / 1000; // km
}

// -----------------------------
// Helper: normalize address names
// -----------------------------
function normalizeAddress(name: string): string {
  if (name.includes("QV7F+QR2")) {
    return "Garden City Business Park";
  }
  return name;
}

// -----------------------------
// Helper: find or create location
// -----------------------------
// Helper: find or create location with type
async function findOrCreateLocation(
  companyId: string,
  loc: { name: string; latitude: number; longitude: number; type?: "office" | "custom" }
) {
  const normalizedName = normalizeAddress(loc.name);
  const existing = await prisma.location.findFirst({
    where: { companyId, name: normalizedName },
  });
  if (existing) return existing;
  return prisma.location.create({
    data: {
      companyId,
      name: normalizedName,
      latitude: loc.latitude,
      longitude: loc.longitude,
      type: loc.type ?? "custom", // default to custom if not provided
    },
  });
}


// -----------------------------
// POST: Create a new route
// -----------------------------
export async function POST(req: Request) {
  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY!;
    const body = await req.json();
    const { companyId, adminId, start, via, end } = body;

    if (!companyId || !adminId || !start || !end) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const startLoc = await findOrCreateLocation(companyId, { ...start, type: start.type });
    const endLoc = await findOrCreateLocation(companyId, { ...end, type: end.type });

    const viaLocs: { id: string; latitude: number; longitude: number }[] = [];
    for (const v of via || []) {
      const loc = await findOrCreateLocation(companyId, { ...v, type: v.type });
      if (loc) viaLocs.push({ id: loc.id, latitude: loc.latitude, longitude: loc.longitude });
    }

    // Calculate distance server-side
    const distance = await calculateDistance(
      { latitude: startLoc.latitude, longitude: startLoc.longitude },
      { latitude: endLoc.latitude, longitude: endLoc.longitude },
      viaLocs,
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


// -----------------------------
// GET: Fetch all routes
// -----------------------------
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

/* ================= PUT (EDIT ROUTE) ================= */

export async function PUT(req: Request) {
  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY!;
    const { routeId, start, end, via } = await req.json();

    if (!routeId || !start || !end) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const route = await prisma.route.findUnique({
      where: { id: routeId },
    });

    if (!route) {
      return NextResponse.json({ error: "Route not found" }, { status: 404 });
    }

    const startLoc = await findOrCreateLocation(route.companyId, start);
    const endLoc = await findOrCreateLocation(route.companyId, end);

    const viaLocs = [];
    for (const v of via || []) {
      const loc = await findOrCreateLocation(route.companyId, v);
      viaLocs.push(loc);
    }

    const distance = await calculateDistance(
      startLoc,
      endLoc,
      viaLocs,
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

    await prisma.routeStop.deleteMany({
      where: { routeId },
    });

    for (let i = 0; i < viaLocs.length; i++) {
      await prisma.routeStop.create({
        data: {
          routeId,
          locationId: viaLocs[i].id,
          order: i,
        },
      });
    }

    const full = await prisma.route.findUnique({
      where: { id: routeId },
      include: {
        company: true,
        admin: true,
        startLocation: true,
        endLocation: true,
        stops: { include: { location: true }, orderBy: { order: "asc" } },
      },
    });

    return NextResponse.json(full);
  } catch (err) {
    console.error("PUT failed:", err);
    return NextResponse.json({ error: "Failed to update route" }, { status: 500 });
  }
}

// -----------------------------
// DELETE: Remove a route
// -----------------------------
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const routeId = searchParams.get("id");

    if (!routeId) {
      return NextResponse.json({ error: "Route ID is required" }, { status: 400 });
    }

    // Find the route with its locations and stops
    const route = await prisma.route.findUnique({
      where: { id: routeId },
      include: {
        startLocation: true,
        endLocation: true,
        stops: { include: { location: true } },
      },
    });

    if (!route) {
      return NextResponse.json({ error: "Route not found" }, { status: 404 });
    }

    // Delete stops first
    await prisma.routeStop.deleteMany({
      where: { routeId },
    });

    // Delete the route itself
    await prisma.route.delete({
      where: { id: routeId },
    });

    // Optionally delete associated locations
    // ⚠️ Only do this if locations are unique to this route.
    const locationIds: string[] = [
      route.startLocation?.id,
      route.endLocation?.id,
      ...route.stops.map((s) => s.location.id),
    ].filter(Boolean);

    if (locationIds.length > 0) {
      try {
        await prisma.location.deleteMany({
          where: { id: { in: locationIds } },
        });
      } catch (err) {
        console.warn("Some locations could not be deleted (likely shared):", err);
      }
    }

    return NextResponse.json(
      { message: "Route deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to delete route:", error);
    return NextResponse.json({ error: "Failed to delete route" }, { status: 500 });
  }
}
