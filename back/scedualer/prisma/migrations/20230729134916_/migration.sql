/*
  Warnings:

  - Changed the type of `shiftType` on the `shift` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `noonShifts` to the `shift_statistic` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "shiftType" AS ENUM ('morning', 'noon', 'night');

-- AlterTable
ALTER TABLE "shift" DROP COLUMN "shiftType",
ADD COLUMN     "shiftType" "shiftType" NOT NULL;

-- AlterTable
ALTER TABLE "shift_statistic" ADD COLUMN     "noonShifts" INTEGER NOT NULL;
