import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { firstName, middleName, lastName, email, password, licenseNumber } = body;

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      firstName,
      middleName,
      lastName,
      email,
      passwordHash: hashedPassword,
      role: "driver",
      driverProfile: {
        create: { licenseNumber },
      },
    },
    include: { driverProfile: true },
  });

  return NextResponse.json(user, { status: 201 });
}

export async function GET() {
  const drivers = await prisma.driver.findMany({
    include: { user: true, documents: true },
  });
  return NextResponse.json(drivers);
}
