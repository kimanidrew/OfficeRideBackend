-- CreateEnum
CREATE TYPE "LocationType" AS ENUM ('office', 'custom');

-- AlterTable
ALTER TABLE "Location" ADD COLUMN     "type" "LocationType" NOT NULL DEFAULT 'custom';
