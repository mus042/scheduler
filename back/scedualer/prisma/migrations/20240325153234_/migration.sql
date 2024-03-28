/*
  Warnings:

  - You are about to drop the `ScheduleMold` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ScheduleMold" DROP CONSTRAINT "ScheduleMold_facilityId_fkey";

-- DropForeignKey
ALTER TABLE "ScheduleMold" DROP CONSTRAINT "ScheduleMold_restDaysId_fkey";

-- DropForeignKey
ALTER TABLE "ScheduleMold" DROP CONSTRAINT "ScheduleMold_scheduleTimeId_fkey";

-- DropForeignKey
ALTER TABLE "ShiftMold" DROP CONSTRAINT "ShiftMold_scheduleId_fkey";

-- DropForeignKey
ALTER TABLE "systemSchedule" DROP CONSTRAINT "systemSchedule_moldId_fkey";

-- DropTable
DROP TABLE "ScheduleMold";

-- CreateTable
CREATE TABLE "scheduleMold" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL DEFAULT 'Default Settings',
    "description" TEXT,
    "daysPerSchedule" INTEGER NOT NULL,
    "selected" BOOLEAN NOT NULL,
    "facilityId" INTEGER NOT NULL,
    "scheduleTimeId" INTEGER,
    "restDaysId" INTEGER,

    CONSTRAINT "scheduleMold_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "scheduleMold_scheduleTimeId_key" ON "scheduleMold"("scheduleTimeId");

-- CreateIndex
CREATE UNIQUE INDEX "scheduleMold_restDaysId_key" ON "scheduleMold"("restDaysId");

-- AddForeignKey
ALTER TABLE "systemSchedule" ADD CONSTRAINT "systemSchedule_moldId_fkey" FOREIGN KEY ("moldId") REFERENCES "scheduleMold"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scheduleMold" ADD CONSTRAINT "scheduleMold_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scheduleMold" ADD CONSTRAINT "scheduleMold_scheduleTimeId_fkey" FOREIGN KEY ("scheduleTimeId") REFERENCES "ScheduleTime"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scheduleMold" ADD CONSTRAINT "scheduleMold_restDaysId_fkey" FOREIGN KEY ("restDaysId") REFERENCES "ScheduleTime"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShiftMold" ADD CONSTRAINT "ShiftMold_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "scheduleMold"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
