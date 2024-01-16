/*
  Warnings:

  - Added the required column `scedhuleDue` to the `schedule` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "schedule" ADD COLUMN     "scedhuleDue" TIMESTAMP(3) NOT NULL;
