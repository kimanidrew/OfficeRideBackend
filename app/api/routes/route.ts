import { prisma } from "../../../lib/prisma";
import { NextResponse } from "next/server";

// Create a route
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { companyId, adminId, start, via, end, distance } = body;

    const route = await prisma.route.create({
      data: { companyId, adminId, start, via, end, distance },
      include: { company: true, admin: true },
    });

    return NextResponse.json(route, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create route" }, { status: 500 });
  }
}


// List all routes
export async function GET() {
  try {
    const routes = await prisma.route.findMany({
      include: { company: true, admin: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(routes, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch routes" }, { status: 500 });
  }
}
