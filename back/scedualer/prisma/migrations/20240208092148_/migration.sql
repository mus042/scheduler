-- AlterTable
ALTER TABLE "shift" ADD COLUMN     "shiftRoleId" INTEGER;

-- AddForeignKey
ALTER TABLE "shift" ADD CONSTRAINT "shift_shiftRoleId_fkey" FOREIGN KEY ("shiftRoleId") REFERENCES "Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;
