/*
  Warnings:

  - A unique constraint covering the columns `[scheduleTimeId]` on the table `ScheduleMold` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[restDaysId]` on the table `ScheduleMold` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "ScheduleMold" ADD COLUMN     "restDaysId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "ScheduleMold_scheduleTimeId_key" ON "ScheduleMold"("scheduleTimeId");

-- CreateIndex
CREATE UNIQUE INDEX "ScheduleMold_restDaysId_key" ON "ScheduleMold"("restDaysId");

-- AddForeignKey
ALTER TABLE "ScheduleMold" ADD CONSTRAINT "ScheduleMold_restDaysId_fkey" FOREIGN KEY ("restDaysId") REFERENCES "ScheduleTime"("id") ON DELETE SET NULL ON UPDATE CASCADE;
