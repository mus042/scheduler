/*
  Warnings:

  - Added the required column `daysPerSchedule` to the `ScheduleMold` table without a default value. This is not possible if the table is not empty.
  - Added the required column `day` to the `ShiftMold` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ScheduleMold" ADD COLUMN     "daysPerSchedule" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "ShiftMold" ADD COLUMN     "day" INTEGER NOT NULL;
