import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DocumentType } from "../../../generated/prisma"; // Ensure path is correct
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const driverId = searchParams.get("driverId");

  if (!driverId) return NextResponse.json({ error: "No ID" }, { status: 400 });

  try {
    const data = await req.formData();
    const file = data.get("file") as File;
    const typeString = data.get("type") as string;

    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

    // 1. Generate a unique filename to prevent overwriting
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const uniqueName = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
    
    // 2. Define the storage path (public/uploads)
    const uploadDir = path.join(process.cwd(), "public/uploads");
    const filePath = path.join(uploadDir, uniqueName);

    // 3. Create directory if it doesn't exist
    await mkdir(uploadDir, { recursive: true });
    
    // 4. Write file to disk
    await writeFile(filePath, buffer);

    // 5. This is the URL that will be saved in the DB
    const fileUrl = `/uploads/${uniqueName}`;

    const doc = await prisma.driverDocument.create({
      data: {
        driverId,
        type: typeString as DocumentType,
        fileUrl,
      },
    });

    return NextResponse.json(doc, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}


// --- PUT: Update document verification status ---
export async function PUT(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const docId = searchParams.get("docId");

  if (!docId) {
    return NextResponse.json({ error: "Missing docId" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { verified } = body;

    if (typeof verified !== "boolean") {
      return NextResponse.json({ error: "Verified status must be a boolean" }, { status: 400 });
    }

    const updatedDoc = await prisma.driverDocument.update({
      where: { id: docId },
      data: { verified },
    });

    return NextResponse.json(updatedDoc, { status: 200 });
  } catch (error) {
    console.error("PUT Error:", error);
    return NextResponse.json({ error: "Failed to update document" }, { status: 500 });
  }
}
