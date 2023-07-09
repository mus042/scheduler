-- DropForeignKey
ALTER TABLE "shift" DROP CONSTRAINT "shift_scheduleId_fkey";

-- DropForeignKey
ALTER TABLE "shift" DROP CONSTRAINT "shift_userId_fkey";

-- AlterTable
ALTER TABLE "shift" ALTER COLUMN "userId" DROP DEFAULT,
ALTER COLUMN "scheduleId" DROP NOT NULL,
ALTER COLUMN "scheduleId" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "shift" ADD CONSTRAINT "shift_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shift" ADD CONSTRAINT "shift_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "schedule"("id") ON DELETE SET NULL ON UPDATE CASCADE;
