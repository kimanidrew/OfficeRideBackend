import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const driverId = searchParams.get("driverId");

  if (!driverId) {
    return NextResponse.json({ error: "Missing driverId" }, { status: 400 });
  }

  const body = await req.json();
  const { verified } = body;

  const driver = await prisma.driver.update({
    where: { id: driverId },
    data: { verified },
  });

  return NextResponse.json(driver);
}
