/*
  Warnings:

  - A unique constraint covering the columns `[shiftDate]` on the table `shift` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "shift" DROP CONSTRAINT "shift_scheduleId_fkey";

-- AlterTable
ALTER TABLE "schedule" ADD COLUMN     "userId" INTEGER;

-- AlterTable
ALTER TABLE "shift" ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "userLevel" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "shift_shiftDate_key" ON "shift"("shiftDate");

-- AddForeignKey
ALTER TABLE "shift" ADD CONSTRAINT "shift_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "schedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule" ADD CONSTRAINT "schedule_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
