/*
  Warnings:

  - You are about to drop the column `end` on the `ScheduleMold` table. All the data in the column will be lost.
  - You are about to drop the column `start` on the `ScheduleMold` table. All the data in the column will be lost.
  - Added the required column `endDay` to the `ScheduleMold` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endHour` to the `ScheduleMold` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDay` to the `ScheduleMold` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startHour` to the `ScheduleMold` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ScheduleMold" DROP COLUMN "end",
DROP COLUMN "start",
ADD COLUMN     "endDay" INTEGER NOT NULL,
ADD COLUMN     "endHour" TEXT NOT NULL,
ADD COLUMN     "startDay" INTEGER NOT NULL,
ADD COLUMN     "startHour" TEXT NOT NULL;
