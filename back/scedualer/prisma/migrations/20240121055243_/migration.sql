/*
  Warnings:

  - Changed the type of `endHour` on the `ScheduleTime` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "ScheduleTime" DROP COLUMN "endHour",
ADD COLUMN     "endHour" INTEGER NOT NULL;
