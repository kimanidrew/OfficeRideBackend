/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Admin` table. All the data in the column will be lost.
  - You are about to drop the column `distanceKm` on the `Route` table. All the data in the column will be lost.
  - You are about to drop the column `endPoint` on the `Route` table. All the data in the column will be lost.
  - You are about to drop the column `startPoint` on the `Route` table. All the data in the column will be lost.
  - Added the required column `distance` to the `Route` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endLocationId` to the `Route` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startLocationId` to the `Route` table without a default value. This is not possible if the table is not empty.
  - Made the column `adminId` on table `Route` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'admin';

-- DropForeignKey
ALTER TABLE "Route" DROP CONSTRAINT "Route_adminId_fkey";

-- AlterTable
ALTER TABLE "Admin" DROP COLUMN "createdAt",
ALTER COLUMN "role" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Route" DROP COLUMN "distanceKm",
DROP COLUMN "endPoint",
DROP COLUMN "startPoint",
ADD COLUMN     "distance" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "endLocationId" TEXT NOT NULL,
ADD COLUMN     "startLocationId" TEXT NOT NULL,
ALTER COLUMN "adminId" SET NOT NULL;

-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RouteStop" (
    "id" TEXT NOT NULL,
    "routeId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "RouteStop_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RouteStop_routeId_order_key" ON "RouteStop"("routeId", "order");

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Route" ADD CONSTRAINT "Route_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Route" ADD CONSTRAINT "Route_startLocationId_fkey" FOREIGN KEY ("startLocationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Route" ADD CONSTRAINT "Route_endLocationId_fkey" FOREIGN KEY ("endLocationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RouteStop" ADD CONSTRAINT "RouteStop_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "Route"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RouteStop" ADD CONSTRAINT "RouteStop_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
