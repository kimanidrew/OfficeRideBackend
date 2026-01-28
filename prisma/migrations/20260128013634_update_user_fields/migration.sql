/*
  Warnings:

  - You are about to drop the column `joinedAt` on the `Driver` table. All the data in the column will be lost.
  - You are about to drop the column `homeLocation` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `profilePicUrl` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `rating` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `schedule` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `workLocation` on the `User` table. All the data in the column will be lost.
  - Added the required column `firstName` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Driver" DROP COLUMN "joinedAt";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "homeLocation",
DROP COLUMN "name",
DROP COLUMN "profilePicUrl",
DROP COLUMN "rating",
DROP COLUMN "schedule",
DROP COLUMN "workLocation",
ADD COLUMN     "firstName" TEXT NOT NULL,
ADD COLUMN     "lastName" TEXT,
ADD COLUMN     "middleName" TEXT;
