/*
  Warnings:

  - You are about to drop the column `endDay` on the `ScheduleMold` table. All the data in the column will be lost.
  - You are about to drop the column `endHour` on the `ScheduleMold` table. All the data in the column will be lost.
  - You are about to drop the column `organizationId` on the `ScheduleMold` table. All the data in the column will be lost.
  - You are about to drop the column `restDayEndDay` on the `ScheduleMold` table. All the data in the column will be lost.
  - You are about to drop the column `restDayEndHour` on the `ScheduleMold` table. All the data in the column will be lost.
  - You are about to drop the column `restDayStartDay` on the `ScheduleMold` table. All the data in the column will be lost.
  - You are about to drop the column `restDayStartHour` on the `ScheduleMold` table. All the data in the column will be lost.
  - You are about to drop the column `startDay` on the `ScheduleMold` table. All the data in the column will be lost.
  - You are about to drop the column `startHour` on the `ScheduleMold` table. All the data in the column will be lost.
  - You are about to drop the column `requiredRoleId` on the `shift` table. All the data in the column will be lost.
  - You are about to drop the column `facility` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `firstName` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `orgId` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `Organization` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `facilityId` to the `ScheduleMold` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ScheduleMold" DROP CONSTRAINT "ScheduleMold_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "shift" DROP CONSTRAINT "shift_requiredRoleId_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_orgId_fkey";

-- AlterTable
ALTER TABLE "ScheduleMold" DROP COLUMN "endDay",
DROP COLUMN "endHour",
DROP COLUMN "organizationId",
DROP COLUMN "restDayEndDay",
DROP COLUMN "restDayEndHour",
DROP COLUMN "restDayStartDay",
DROP COLUMN "restDayStartHour",
DROP COLUMN "startDay",
DROP COLUMN "startHour",
ADD COLUMN     "facilityId" INTEGER NOT NULL,
ADD COLUMN     "scheduleTimeId" INTEGER;

-- AlterTable
ALTER TABLE "shift" DROP COLUMN "requiredRoleId";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "facility",
DROP COLUMN "firstName",
DROP COLUMN "lastName",
DROP COLUMN "orgId",
ADD COLUMN     "facilityId" INTEGER;

-- DropTable
DROP TABLE "Organization";

-- CreateTable
CREATE TABLE "UserProfile" (
    "id" SERIAL NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Facility" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Facility_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduleTime" (
    "id" SERIAL NOT NULL,
    "startDay" INTEGER NOT NULL,
    "startHour" TEXT NOT NULL,
    "endDay" INTEGER NOT NULL,
    "endHour" TEXT NOT NULL,

    CONSTRAINT "ScheduleTime_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoleShiftMold" (
    "shiftMoldId" INTEGER NOT NULL,
    "roleId" INTEGER NOT NULL,
    "scheduleMoldId" INTEGER,

    CONSTRAINT "RoleShiftMold_pkey" PRIMARY KEY ("shiftMoldId","roleId")
);

-- CreateTable
CREATE TABLE "UserShiftRole" (
    "shiftId" INTEGER NOT NULL,
    "roleId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "UserShiftRole_pkey" PRIMARY KEY ("shiftId","roleId","userId")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_userId_key" ON "UserProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Facility_name_key" ON "Facility"("name");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleMold" ADD CONSTRAINT "ScheduleMold_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleMold" ADD CONSTRAINT "ScheduleMold_scheduleTimeId_fkey" FOREIGN KEY ("scheduleTimeId") REFERENCES "ScheduleTime"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoleShiftMold" ADD CONSTRAINT "RoleShiftMold_shiftMoldId_fkey" FOREIGN KEY ("shiftMoldId") REFERENCES "ShiftMold"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoleShiftMold" ADD CONSTRAINT "RoleShiftMold_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoleShiftMold" ADD CONSTRAINT "RoleShiftMold_scheduleMoldId_fkey" FOREIGN KEY ("scheduleMoldId") REFERENCES "ScheduleMold"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserShiftRole" ADD CONSTRAINT "UserShiftRole_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "shift"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserShiftRole" ADD CONSTRAINT "UserShiftRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserShiftRole" ADD CONSTRAINT "UserShiftRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
