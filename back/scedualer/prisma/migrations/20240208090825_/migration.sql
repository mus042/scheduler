/*
  Warnings:

  - You are about to drop the `UserShiftRole` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserShiftRole" DROP CONSTRAINT "UserShiftRole_roleId_fkey";

-- DropForeignKey
ALTER TABLE "UserShiftRole" DROP CONSTRAINT "UserShiftRole_shiftId_fkey";

-- DropForeignKey
ALTER TABLE "UserShiftRole" DROP CONSTRAINT "UserShiftRole_userId_fkey";

-- DropTable
DROP TABLE "UserShiftRole";
