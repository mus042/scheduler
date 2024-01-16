/*
  Warnings:

  - Made the column `userId` on table `schedule` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "schedule" ALTER COLUMN "userId" SET NOT NULL;
