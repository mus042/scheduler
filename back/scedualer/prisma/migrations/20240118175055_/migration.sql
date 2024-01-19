/*
  Warnings:

  - Added the required column `restDayEndDay` to the `ScheduleMold` table without a default value. This is not possible if the table is not empty.
  - Added the required column `restDayEndHour` to the `ScheduleMold` table without a default value. This is not possible if the table is not empty.
  - Added the required column `restDayStartDay` to the `ScheduleMold` table without a default value. This is not possible if the table is not empty.
  - Added the required column `restDayStartHour` to the `ScheduleMold` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ScheduleMold" ADD COLUMN     "restDayEndDay" INTEGER NOT NULL,
ADD COLUMN     "restDayEndHour" TEXT NOT NULL,
ADD COLUMN     "restDayStartDay" INTEGER NOT NULL,
ADD COLUMN     "restDayStartHour" TEXT NOT NULL;
