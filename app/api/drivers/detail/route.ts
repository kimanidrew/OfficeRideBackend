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

    // 1. Switch from req.json() to req.formData()
    const formData = await req.formData();
    
    const firstName = formData.get("firstName") as string;
    const middleName = formData.get("middleName") as string;
    const lastName = formData.get("lastName") as string;
    const email = formData.get("email") as string;
    const licenseNumber = formData.get("licenseNumber") as string;
    const profilePicFile = formData.get("profilePic") as File | null;

    let profilePicUrl = formData.get("profilePicUrl") as string;

    // 2. Handle File Upload (Example: Saving to public/uploads)
    if (profilePicFile && typeof profilePicFile !== "string") {
      const bytes = await profilePicFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const filename = `${Date.now()}-${profilePicFile.name.replace(/\s+/g, "-")}`;
      const uploadPath = path.join(process.cwd(), "public/uploads", filename);
      
      await writeFile(uploadPath, buffer);
      profilePicUrl = `/uploads/${filename}`; // This is what we save in DB
    }

    // 3. Update Database
    const updatedDriver = await prisma.driver.update({
      where: { id: driverId },
      data: {
        licenseNumber,
        user: {
          update: {
            firstName,
            middleName,
            lastName,
            email,
            profilePicUrl, // The new path
          },
        },
      },
      include: { user: true, documents: true },
    });

    return NextResponse.json(updatedDriver, { status: 200 });
  } catch (error: any) {
    console.error("Update Error:", error);
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

