-- AlterTable
ALTER TABLE "schedule" ADD COLUMN     "facilityId" INTEGER;

-- AddForeignKey
ALTER TABLE "schedule" ADD CONSTRAINT "schedule_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility"("id") ON DELETE SET NULL ON UPDATE CASCADE;
