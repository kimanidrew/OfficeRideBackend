-- DropForeignKey
ALTER TABLE "Route" DROP CONSTRAINT "Route_adminId_fkey";

-- AddForeignKey
ALTER TABLE "Route" ADD CONSTRAINT "Route_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
