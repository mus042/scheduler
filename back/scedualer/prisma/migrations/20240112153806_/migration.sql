-- AlterTable
ALTER TABLE "ScheduleMold" ALTER COLUMN "name" SET DEFAULT 'deafult Settings';

-- AlterTable
ALTER TABLE "ShiftMold" ALTER COLUMN "startHour" SET DATA TYPE TEXT,
ALTER COLUMN "endHour" SET DATA TYPE TEXT;
