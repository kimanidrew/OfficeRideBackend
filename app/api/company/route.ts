import { prisma } from "../../../lib/prisma";
import { NextResponse } from "next/server";


// Named export for POST requests
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { companyName, domainName } = body;

    const company = await prisma.company.create({
      data: { companyName, domainName },
    });

    return NextResponse.json(company, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create company" },
      { status: 500 }
    );
  }
}

// POST already exists for creating companies
export async function GET() {
  try {
    const companies = await prisma.company.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(companies, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch companies" },
      { status: 500 }
    );
  }
}
