import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  const passwordHash = await bcrypt.hash("Singer@8031!!", 10);

  // 1. Create the BASE USER
  const user = await prisma.user.upsert({
    where: { email: "superadmin@officeride.com" },
    update: {},
    create: {
      firstName: "Super",
      lastName: "Admin",
      email: "superadmin@officeride.com",
      passwordHash,
      role: "admin",
    },
  });

  // 2. Create the ADMIN PROFILE linked to that User
  const admin = await prisma.admin.upsert({
    where: { email: "superadmin@officeride.com" },
    update: {},
    create: {
      userId: user.id, // Linking the two
      name: "Super Admin",
      email: "superadmin@officeride.com",
      passwordHash,
      role: "superadmin",
    },
  });

  console.log("✅ Same user created in both tables!");
  console.log("Use this for POST /routes adminId:", user.id);
}


main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
