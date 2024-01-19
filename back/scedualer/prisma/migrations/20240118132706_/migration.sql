/*
  Warnings:

  - You are about to drop the column `shiftType` on the `shift` table. All the data in the column will be lost.
  - Added the required column `role` to the `shift` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shiftName` to the `shift` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "shift" DROP COLUMN "shiftType",
ADD COLUMN     "role" TEXT NOT NULL,
ADD COLUMN     "shiftName" TEXT NOT NULL,
ADD COLUMN     "shiftTypeId" INTEGER;

-- DropEnum
DROP TYPE "shiftType";

-- CreateTable
CREATE TABLE "shift_types" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "shift_types_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "shift" ADD CONSTRAINT "shift_shiftTypeId_fkey" FOREIGN KEY ("shiftTypeId") REFERENCES "shift_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;
