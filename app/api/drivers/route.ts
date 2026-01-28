import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { firstName, middleName, lastName, email, password, licenseNumber } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        firstName,
        middleName, // optional
        lastName,   // optional
        email,
        passwordHash: hashedPassword,
        role: "driver",
        driverProfile: {
          create: { licenseNumber },
        },
      },
      include: { driverProfile: true },
    });

    return res.status(201).json(user);
  }

  if (req.method === "GET") {
    const drivers = await prisma.driver.findMany({
      include: { user: true, documents: true },
    });
    return res.json(drivers);
  }

  res.status(405).end();
}
