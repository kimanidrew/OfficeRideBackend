import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// CREATE NEW VEHICLE
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const newVehicle = await prisma.vehicle.create({
      data: {
        make: body.make,
        model: body.model,
        plateNumber: body.plateNumber,
        year: parseInt(body.year),
        color: body.color,
        driverId: body.driverId, // Link to the driver
      }
    });
    return NextResponse.json(newVehicle, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create vehicle" }, { status: 500 });
  }
}

// UPDATE EXISTING VEHICLE
export async function PUT(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const body = await req.json();

  const updated = await prisma.vehicle.update({
    where: { id: id as string },
    data: {
      make: body.make,
      model: body.model,
      plateNumber: body.plateNumber,
      year: parseInt(body.year),
      color: body.color
    }
  });
  return NextResponse.json(updated);
}
