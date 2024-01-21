/*
  Warnings:

  - You are about to drop the column `scheduleType` on the `shift` table. All the data in the column will be lost.
  - Added the required column `shiftType` to the `shift` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "shift" DROP COLUMN "scheduleType",
ADD COLUMN     "shiftType" "scheduleType" NOT NULL;
