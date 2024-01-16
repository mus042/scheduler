-- AddForeignKey
ALTER TABLE "userRequest" ADD CONSTRAINT "userRequest_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "shift"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
