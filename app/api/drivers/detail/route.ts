import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeFile } from "fs/promises";
import path from "path";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const driverId = searchParams.get("driverId");

  if (!driverId) {
    return NextResponse.json({ error: "Missing driverId" }, { status: 400 });
  }

  // ✅ ADDED: vehicles: true to the include object
  const driver = await prisma.driver.findUnique({
    where: { id: driverId },
    include: { 
      user: true, 
      documents: true,
      vehicles: true // This will now return the vehicle array
    },
  });

  if (!driver) {
    return NextResponse.json({ error: "Driver not found" }, { status: 404 });
  }

  return NextResponse.json(driver);
}


export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const driverId = searchParams.get("driverId");

    if (!driverId) return NextResponse.json({ error: "Missing driverId" }, { status: 400 });

    const formData = await req.formData();
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const email = formData.get("email") as string;
    const profilePicFile = formData.get("profilePic") as File | null;

    let profilePicUrl = formData.get("profilePicUrl") as string;

    // ✅ FIX FOR PRODUCTION: Convert File to Base64 String
    if (profilePicFile && typeof profilePicFile !== "string") {
      const arrayBuffer = await profilePicFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64Image = buffer.toString("base64");
      
      // Create a Data URL that can be used directly in <img> tags
      profilePicUrl = `data:${profilePicFile.type};base64,${base64Image}`;
    }

    const updatedDriver = await prisma.driver.update({
      where: { id: driverId },
      data: {
        user: {
          update: {
            firstName,
            lastName,
            email,
            profilePicUrl, // Now saving the long Base64 string to DB
          },
        },
      },
      include: { user: true, documents: true, vehicles: true },
    });

    return NextResponse.json(updatedDriver, { status: 200 });
  } catch (error: any) {
    console.error("Base64 Upload Error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
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

