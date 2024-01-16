/*
  Warnings:

  - A unique constraint covering the columns `[selected]` on the table `ScheduleMold` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `selected` to the `ScheduleMold` table without a default value. This is not possible if the table is not empty.
  - Added the required column `requestAnswerSeen` to the `userRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "requestStatus" ADD VALUE 'replied';
ALTER TYPE "requestStatus" ADD VALUE 'approved';

-- AlterTable
ALTER TABLE "ScheduleMold" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "selected" BOOLEAN NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "userRequest" ADD COLUMN     "requestAnswerSeen" BOOLEAN NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "ScheduleMold_selected_key" ON "ScheduleMold"("selected");
