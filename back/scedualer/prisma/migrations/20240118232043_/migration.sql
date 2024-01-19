/*
  Warnings:

  - You are about to drop the column `shiftTypeId` on the `shift` table. All the data in the column will be lost.
  - You are about to drop the `shift_types` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `shiftType` to the `shift` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "shiftType" AS ENUM ('morning', 'noon', 'noonCanceled', 'night', 'other');

-- DropForeignKey
ALTER TABLE "shift" DROP CONSTRAINT "shift_shiftTypeId_fkey";

-- AlterTable
ALTER TABLE "shift" DROP COLUMN "shiftTypeId",
ADD COLUMN     "shiftType" "shiftType" NOT NULL;

-- DropTable
DROP TABLE "shift_types";
