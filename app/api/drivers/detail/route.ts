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
  try {
    const { searchParams } = new URL(req.url);
    const driverId = searchParams.get("driverId");

    if (!driverId) {
      return NextResponse.json({ error: "Missing driverId" }, { status: 400 });
    }

    const body = await req.json();
    const { 
      firstName, 
      middleName, 
      lastName, 
      email, 
      licenseNumber, 
      profilePicUrl,
      verified 
    } = body;

    // Use Prisma's nested update to modify both tables in one transaction
    const updatedDriver = await prisma.driver.update({
      where: { id: driverId },
      data: {
        licenseNumber, // Updates Driver table
        verified,      // Updates Driver table
        user: {        // Navigates to User table
          update: {
            firstName,
            middleName,
            lastName,
            email,
            profilePicUrl,
          },
        },
      },
      include: { 
        user: true,
        documents: true,
        vehicles: true 
      },
    });

    return NextResponse.json(updatedDriver, { status: 200 });
  } catch (error: any) {
    console.error("Update Error:", error);
    // Handle Prisma unique constraint errors (e.g., email already taken)
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "Email already in use" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update driver" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const driverId = searchParams.get("driverId");

    if (!driverId) {
      return NextResponse.json({ error: "Missing driverId" }, { status: 400 });
    }

    // 1. Find the driver to get the associated userId
    const driver = await prisma.driver.findUnique({
      where: { id: driverId },
      select: { userId: true }
    });

    if (!driver) {
      return NextResponse.json({ error: "Driver not found" }, { status: 404 });
    }

    // 2. Perform deletion in a transaction (Clean up both tables)
    await prisma.$transaction([
      // Delete child records first if they don't have Cascade delete
      prisma.driverDocument.deleteMany({ where: { driverId } }),
      prisma.vehicle.deleteMany({ where: { driverId } }),
      // Delete the driver profile
      prisma.driver.delete({ where: { id: driverId } }),
      // Delete the actual user account
      prisma.user.delete({ where: { id: driver.userId } }),
    ]);

    return NextResponse.json({ message: "Driver deleted successfully" });
  } catch (error: any) {
    console.error("Delete Error:", error);
    return NextResponse.json({ error: "Failed to delete driver" }, { status: 500 });
  }
}

