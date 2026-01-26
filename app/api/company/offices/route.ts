import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId");

    if (!companyId) {
      return NextResponse.json(
        { error: "companyId is required" },
        { status: 400 }
      );
    }

    const offices = await prisma.location.findMany({
      where: {
        companyId,
        type: "office",
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(offices, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch office locations:", error);
    return NextResponse.json(
      { error: "Failed to fetch office locations" },
      { status: 500 }
    );
  }
}
