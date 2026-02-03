import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * PUT: Toggles the verification status of a specific vehicle
 * URL: /api/vehicles/verify?id=[VEHICLE_ID]
 */
export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Missing Vehicle ID" }, 
        { status: 400 }
      );
    }

    // Get the new verification status from the body
    const { verified } = await req.json();

    if (typeof verified !== "boolean") {
      return NextResponse.json(
        { error: "Invalid status provided. Must be a boolean." }, 
        { status: 400 }
      );
    }

    // Update the vehicle record in the database
    const updatedVehicle = await prisma.vehicle.update({
      where: { id: id },
      data: { verified },
    });

    return NextResponse.json(updatedVehicle, { status: 200 });
    
  } catch (error: any) {
    console.error("❌ Vehicle Verification Error:", error);
    
    // Handle Prisma specific errors (Record not found)
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: "Vehicle record not found" }, 
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update vehicle status" }, 
      { status: 500 }
    );
  }
}
