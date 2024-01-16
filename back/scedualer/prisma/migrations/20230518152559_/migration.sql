/*
  Warnings:

  - Added the required column `shiftType` to the `shift` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "shift" ADD COLUMN     "shiftType" INTEGER NOT NULL;
