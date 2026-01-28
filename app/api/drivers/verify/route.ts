import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Parse query params using URL
  const { searchParams } = new URL(req.url!, `http://${req.headers.host}`);
  const driverId = searchParams.get("driverId");

  if (req.method === "PUT") {
    const { verified } = req.body;

    if (!driverId) {
      return res.status(400).json({ error: "Missing driverId" });
    }

    const driver = await prisma.driver.update({
      where: { id: driverId },
      data: { verified },
    });

    return res.json(driver);
  }

  res.status(405).end();
}
