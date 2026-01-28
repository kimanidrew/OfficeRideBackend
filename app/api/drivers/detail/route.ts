import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const driverId = searchParams.get("driverId");

  if (!driverId) {
    return NextResponse.json({ error: "Missing driverId" }, { status: 400 });
  }

  const driver = await prisma.driver.findUnique({
    where: { id: driverId },
    include: { user: true, documents: true },
  });

  return NextResponse.json(driver);
}

export async function PUT(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const driverId = searchParams.get("driverId");

  if (!driverId) {
    return NextResponse.json({ error: "Missing driverId" }, { status: 400 });
  }

  const body = await req.json();
  const driver = await prisma.driver.update({
    where: { id: driverId },
    data: { licenseNumber: body.licenseNumber },
    include: { user: true, documents: true },
  });

  return NextResponse.json(driver);
}
