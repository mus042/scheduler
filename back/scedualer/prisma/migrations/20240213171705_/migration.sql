/*
  Warnings:

  - You are about to drop the `schedule` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `shift` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `shift_statistic` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "schedule" DROP CONSTRAINT "schedule_facilityId_fkey";

-- DropForeignKey
ALTER TABLE "schedule" DROP CONSTRAINT "schedule_userId_fkey";

-- DropForeignKey
ALTER TABLE "shift" DROP CONSTRAINT "shift_scheduleId_fkey";

-- DropForeignKey
ALTER TABLE "shift" DROP CONSTRAINT "shift_shiftRoleId_fkey";

-- DropForeignKey
ALTER TABLE "shift" DROP CONSTRAINT "shift_userId_fkey";

-- DropForeignKey
ALTER TABLE "shift_statistic" DROP CONSTRAINT "shift_statistic_schedule_id_fkey";

-- DropForeignKey
ALTER TABLE "shift_statistic" DROP CONSTRAINT "shift_statistic_user_id_fkey";

-- DropForeignKey
ALTER TABLE "userRequest" DROP CONSTRAINT "userRequest_shiftId_fkey";

-- DropTable
DROP TABLE "schedule";

-- DropTable
DROP TABLE "shift";

-- DropTable
DROP TABLE "shift_statistic";

-- CreateTable
CREATE TABLE "userInvites" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "key" TEXT NOT NULL,
    "valid" TIMESTAMP(3) NOT NULL,
    "facilityId" INTEGER NOT NULL,

    CONSTRAINT "userInvites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "userShift" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "shiftName" TEXT NOT NULL,
    "typeOfShift" "typeOfShift",
    "shiftTimeName" "shiftTimeClassification",
    "shiftStartHour" TIMESTAMP(3),
    "shiftEndHour" TIMESTAMP(3),
    "userId" INTEGER,
    "userPreference" TEXT,
    "scheduleId" INTEGER,

    CONSTRAINT "userShift_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "userSchedule" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "scheduleStart" TIMESTAMP(3) NOT NULL,
    "scheduleEnd" TIMESTAMP(3) NOT NULL,
    "scheduleDue" TIMESTAMP(3),
    "userId" INTEGER NOT NULL,
    "isLocked" BOOLEAN NOT NULL,
    "facilityId" INTEGER NOT NULL,

    CONSTRAINT "userSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "systemSchedule" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "scheduleStart" TIMESTAMP(3) NOT NULL,
    "scheduleEnd" TIMESTAMP(3) NOT NULL,
    "scheduleDue" TIMESTAMP(3),
    "isSelected" BOOLEAN NOT NULL,
    "moldId" INTEGER NOT NULL,
    "facilityId" INTEGER,

    CONSTRAINT "systemSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "systemShift" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "shiftName" TEXT NOT NULL,
    "typeOfShift" "typeOfShift",
    "shiftTimeName" "shiftTimeClassification",
    "shiftStartHour" TIMESTAMP(3),
    "shiftEndHour" TIMESTAMP(3),
    "userId" INTEGER,
    "userPreference" TEXT,
    "scheduleId" INTEGER,
    "shiftRoleId" INTEGER,

    CONSTRAINT "systemShift_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shift_user_statistics" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "morningShifts" INTEGER NOT NULL,
    "noonShifts" INTEGER NOT NULL,
    "nightShifts" INTEGER NOT NULL,
    "overTimeStep1" INTEGER NOT NULL,
    "overTimeStep2" INTEGER NOT NULL,
    "restDayHours" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "system_schedule_id" INTEGER,
    "user_schedule_id" INTEGER,

    CONSTRAINT "shift_user_statistics_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "userShift" ADD CONSTRAINT "userShift_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userShift" ADD CONSTRAINT "userShift_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "userSchedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userSchedule" ADD CONSTRAINT "userSchedule_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userSchedule" ADD CONSTRAINT "userSchedule_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "systemSchedule" ADD CONSTRAINT "systemSchedule_moldId_fkey" FOREIGN KEY ("moldId") REFERENCES "ScheduleMold"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "systemSchedule" ADD CONSTRAINT "systemSchedule_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "systemShift" ADD CONSTRAINT "systemShift_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "systemShift" ADD CONSTRAINT "systemShift_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "systemSchedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "systemShift" ADD CONSTRAINT "systemShift_shiftRoleId_fkey" FOREIGN KEY ("shiftRoleId") REFERENCES "Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userRequest" ADD CONSTRAINT "userRequest_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "systemShift"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shift_user_statistics" ADD CONSTRAINT "shift_user_statistics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shift_user_statistics" ADD CONSTRAINT "shift_user_statistics_system_schedule_id_fkey" FOREIGN KEY ("system_schedule_id") REFERENCES "systemSchedule"("id") ON DELETE SET NULL ON UPDATE CASCADE;
