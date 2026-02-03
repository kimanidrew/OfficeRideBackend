import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma"; 

export async function GET() {
  try {
    // 1. Get counts for drivers, routes, and companies
    // For 'Active Drivers', we count users with the 'driver' or 'both' role
    const [activeDrivers, totalRoutes, companyCount] = await Promise.all([
      prisma.user.count({ 
        where: { role: { in: ['driver', 'both'] } } 
      }),
      prisma.route.count(),
      prisma.company.count(),
    ]);

    // 2. Get Daily Rides (rides created in the last 24 hours)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dailyRides = await prisma.ride.count({
      where: {
        createdAt: { gte: today }
      }
    });

    return NextResponse.json({
      activeDrivers,
      totalRoutes,
      companyCount,
      dailyRides,
    });
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    return NextResponse.json({ error: "Failed to fetch statistics" }, { status: 500 });
  }
}
