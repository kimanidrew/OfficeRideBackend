import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const userId = formData.get("userId") as string | null;

  if (!file || !userId) {
    return NextResponse.json({ error: "Missing file or userId" }, { status: 400 });
  }

  // Generate unique filename
  const ext = path.extname(file.name);
  const fileName = `${uuidv4()}${ext}`;
  const filePath = path.join(process.cwd(), "public", "uploads", fileName);

  // Convert File to Buffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Save file locally
  await fs.writeFile(filePath, buffer);

  // Public URL
  const fileUrl = `/uploads/${fileName}`;

  // Update user record in DB
  const user = await prisma.user.update({
    where: { id: userId },
    data: { profilePicUrl: fileUrl },
  });

  return NextResponse.json({ url: fileUrl, user }, { status: 201 });
}
