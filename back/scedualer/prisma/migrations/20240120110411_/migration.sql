/*
  Warnings:

  - You are about to drop the column `shiftDate` on the `shift` table. All the data in the column will be lost.
  - Added the required column `startMinutes` to the `ScheduleTime` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shiftTimeName` to the `shift` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "shiftTimeClassification" AS ENUM ('morning', 'noon', 'noonCanceled', 'night', 'other');

-- AlterTable
ALTER TABLE "ScheduleTime" ADD COLUMN     "name" TEXT,
ADD COLUMN     "startMinutes" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "shift" DROP COLUMN "shiftDate",
ADD COLUMN     "shiftTimeName" "shiftTimeClassification" NOT NULL;

-- DropEnum
DROP TYPE "shiftTime";
