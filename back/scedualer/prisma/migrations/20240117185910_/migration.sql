-- DropForeignKey
ALTER TABLE "userRequest" DROP CONSTRAINT "userRequest_shiftId_fkey";

-- AddForeignKey
ALTER TABLE "userRequest" ADD CONSTRAINT "userRequest_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "shift"("id") ON DELETE CASCADE ON UPDATE CASCADE;
