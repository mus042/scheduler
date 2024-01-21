/*
  Warnings:

  - Added the required column `endMinutes` to the `ScheduleTime` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `startHour` on the `ScheduleTime` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "RoleShiftMold" DROP CONSTRAINT "RoleShiftMold_scheduleMoldId_fkey";

-- AlterTable
ALTER TABLE "ScheduleTime" ADD COLUMN     "endMinutes" INTEGER NOT NULL,
DROP COLUMN "startHour",
ADD COLUMN     "startHour" INTEGER NOT NULL;
