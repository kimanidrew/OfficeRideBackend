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
      role: "driver", // ✅ must match Role enum
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
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          middleName: true,
          lastName: true,
          email: true,
          profilePicUrl: true,
        },
      },
      documents: {
        select: {
          id: true,
          type: true,
          fileUrl: true,
          verified: true,
          uploadedAt: true,
        },
      },
      vehicles: {
        select: {
          id: true,
          make: true,
          model: true,
          year: true,
          plateNumber: true,
          color: true,
          verified: true,
        },
      },
    },
  });

  return NextResponse.json(drivers);
}
