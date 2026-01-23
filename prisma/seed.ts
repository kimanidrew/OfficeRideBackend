import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  // Hash the password securely
  const passwordHash = await bcrypt.hash("Singer@8031!!", 10);

  // Create or update a super admin
  const superAdmin = await prisma.admin.upsert({
    where: { email: "superadmin@officeride.com" }, // must match create.email
    update: {},
    create: {
      name: "Super Admin",
      email: "superadmin@officeride.com", // fixed to match where clause
      passwordHash,
      role: "superadmin",
    },
  });

  console.log("Super admin created:", superAdmin);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
