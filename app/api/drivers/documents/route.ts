import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const driverId = searchParams.get("driverId");

  if (!driverId) {
    return NextResponse.json({ error: "Missing driverId" }, { status: 400 });
  }

  const body = await req.json();
  const { type, fileUrl } = body;

  const doc = await prisma.driverDocument.create({
    data: {
      driverId,
      type,
      fileUrl,
    },
  });

  return NextResponse.json(doc, { status: 201 });
}
