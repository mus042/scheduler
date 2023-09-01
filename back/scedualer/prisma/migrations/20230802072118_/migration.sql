/*
  Warnings:

  - Added the required column `overTimeStep1` to the `shift_statistic` table without a default value. This is not possible if the table is not empty.
  - Added the required column `overTimeStep2` to the `shift_statistic` table without a default value. This is not possible if the table is not empty.
  - Added the required column `restDayHours` to the `shift_statistic` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "shift_statistic" ADD COLUMN     "overTimeStep1" INTEGER NOT NULL,
ADD COLUMN     "overTimeStep2" INTEGER NOT NULL,
ADD COLUMN     "restDayHours" INTEGER NOT NULL;
