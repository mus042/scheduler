-- AlterTable
ALTER TABLE "shift" ALTER COLUMN "shiftDate" DROP NOT NULL,
ALTER COLUMN "shifttStartHour" DROP NOT NULL,
ALTER COLUMN "shiftEndHour" DROP NOT NULL,
ALTER COLUMN "userId" SET DEFAULT 0,
ALTER COLUMN "userPreference" DROP NOT NULL,
ALTER COLUMN "scheduleId" SET DEFAULT 0;
