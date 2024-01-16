/*
  Warnings:

  - You are about to drop the `Rank` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ScheduleMold` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ShiftMold` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserPreference` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ScheduleMold" DROP CONSTRAINT "ScheduleMold_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "ShiftMold" DROP CONSTRAINT "ShiftMold_scheduleId_fkey";

-- DropForeignKey
ALTER TABLE "UserPreference" DROP CONSTRAINT "UserPreference_rankId_fkey";

-- DropForeignKey
ALTER TABLE "UserPreference" DROP CONSTRAINT "UserPreference_shiftMoldId_fkey";

-- DropTable
DROP TABLE "Rank";

-- DropTable
DROP TABLE "ScheduleMold";

-- DropTable
DROP TABLE "ShiftMold";

-- DropTable
DROP TABLE "UserPreference";
