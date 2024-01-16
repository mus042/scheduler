/*
  Warnings:

  - Added the required column `sceduleType` to the `schedule` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "shcheduleType" AS ENUM ('userSchedule', 'systemSchedule');

-- AlterTable
ALTER TABLE "schedule" ADD COLUMN     "sceduleType" "shcheduleType" NOT NULL;
