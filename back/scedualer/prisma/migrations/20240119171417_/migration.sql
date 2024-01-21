/*
  Warnings:

  - The values [recived] on the enum `requestStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `rankId` on the `UserPreference` table. All the data in the column will be lost.
  - You are about to drop the column `scedhuleDue` on the `schedule` table. All the data in the column will be lost.
  - You are about to drop the column `scedualEnd` on the `schedule` table. All the data in the column will be lost.
  - You are about to drop the column `scedualStart` on the `schedule` table. All the data in the column will be lost.
  - You are about to drop the column `sceduleType` on the `schedule` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `shift` table. All the data in the column will be lost.
  - You are about to drop the column `shiftType` on the `shift` table. All the data in the column will be lost.
  - You are about to drop the column `shifttStartHour` on the `shift` table. All the data in the column will be lost.
  - You are about to drop the column `destionationUserId` on the `userRequest` table. All the data in the column will be lost.
  - You are about to drop the column `isAprroved` on the `userRequest` table. All the data in the column will be lost.
  - You are about to drop the column `requsetMsg` on the `userRequest` table. All the data in the column will be lost.
  - You are about to drop the column `typeOfUser` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `userRole` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `Rank` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[senderId,destinationUserId,shiftId]` on the table `userRequest` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `roleId` to the `UserPreference` table without a default value. This is not possible if the table is not empty.
  - Added the required column `scheduleEnd` to the `schedule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `scheduleStart` to the `schedule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `scheduleType` to the `schedule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `scheduleType` to the `shift` table without a default value. This is not possible if the table is not empty.
  - Added the required column `destinationUserId` to the `userRequest` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "shiftTime" AS ENUM ('morning', 'noon', 'noonCanceled', 'night', 'other');

-- CreateEnum
CREATE TYPE "serverRole" AS ENUM ('admin', 'user');

-- CreateEnum
CREATE TYPE "scheduleType" AS ENUM ('userSchedule', 'systemSchedule');

-- AlterEnum
BEGIN;
CREATE TYPE "requestStatus_new" AS ENUM ('pending', 'sent', 'received', 'seen', 'replied', 'approved');
ALTER TABLE "userRequest" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "userRequest" ALTER COLUMN "status" TYPE "requestStatus_new" USING ("status"::text::"requestStatus_new");
ALTER TYPE "requestStatus" RENAME TO "requestStatus_old";
ALTER TYPE "requestStatus_new" RENAME TO "requestStatus";
DROP TYPE "requestStatus_old";
ALTER TABLE "userRequest" ALTER COLUMN "status" SET DEFAULT 'pending';
COMMIT;

-- DropForeignKey
ALTER TABLE "UserPreference" DROP CONSTRAINT "UserPreference_rankId_fkey";

-- DropForeignKey
ALTER TABLE "userRequest" DROP CONSTRAINT "userRequest_destionationUserId_fkey";

-- DropIndex
DROP INDEX "userRequest_senderId_destionationUserId_shiftId_key";

-- AlterTable
ALTER TABLE "ScheduleMold" ALTER COLUMN "name" SET DEFAULT 'Default Settings';

-- AlterTable
ALTER TABLE "UserPreference" DROP COLUMN "rankId",
ADD COLUMN     "roleId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "schedule" DROP COLUMN "scedhuleDue",
DROP COLUMN "scedualEnd",
DROP COLUMN "scedualStart",
DROP COLUMN "sceduleType",
ADD COLUMN     "scheduleDue" TIMESTAMP(3),
ADD COLUMN     "scheduleEnd" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "scheduleStart" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "scheduleType" "scheduleType" NOT NULL;

-- AlterTable
ALTER TABLE "shift" DROP COLUMN "role",
DROP COLUMN "shiftType",
DROP COLUMN "shifttStartHour",
ADD COLUMN     "requiredRoleId" INTEGER,
ADD COLUMN     "scheduleType" "scheduleType" NOT NULL,
ADD COLUMN     "shiftStartHour" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "userRequest" DROP COLUMN "destionationUserId",
DROP COLUMN "isAprroved",
DROP COLUMN "requsetMsg",
ADD COLUMN     "destinationUserId" INTEGER NOT NULL,
ADD COLUMN     "isApproved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "requestMsg" TEXT;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "typeOfUser",
DROP COLUMN "userRole",
ADD COLUMN     "roleId" INTEGER,
ADD COLUMN     "userServerRole" "serverRole" NOT NULL DEFAULT 'user';

-- DropTable
DROP TABLE "Rank";

-- DropEnum
DROP TYPE "Role";

-- DropEnum
DROP TYPE "shcheduleType";

-- DropEnum
DROP TYPE "shiftType";

-- DropEnum
DROP TYPE "typeOfUser";

-- CreateTable
CREATE TABLE "Role" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "userRequest_senderId_destinationUserId_shiftId_key" ON "userRequest"("senderId", "destinationUserId", "shiftId");

-- AddForeignKey
ALTER TABLE "shift" ADD CONSTRAINT "shift_requiredRoleId_fkey" FOREIGN KEY ("requiredRoleId") REFERENCES "Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userRequest" ADD CONSTRAINT "userRequest_destinationUserId_fkey" FOREIGN KEY ("destinationUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPreference" ADD CONSTRAINT "UserPreference_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
