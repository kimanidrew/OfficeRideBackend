import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Parse query params using URL
  const { searchParams } = new URL(req.url!, `http://${req.headers.host}`);
  const driverId = searchParams.get("driverId");

  if (req.method === "POST") {
    const { type, fileUrl } = req.body;

    if (!driverId) {
      return res.status(400).json({ error: "Missing driverId" });
    }

    const doc = await prisma.driverDocument.create({
      data: {
        driverId,
        type,
        fileUrl,
      },
    });

    return res.status(201).json(doc);
  }

  res.status(405).end();
}
