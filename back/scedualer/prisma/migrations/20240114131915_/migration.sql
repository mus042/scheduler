/*
  Warnings:

  - The values [morning,noon,night,noonCanceled] on the enum `shiftType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "shiftType_new" AS ENUM ('Morning', 'Noon', 'NoonCanceled', 'Night');
ALTER TABLE "shift" ALTER COLUMN "shiftType" TYPE "shiftType_new" USING ("shiftType"::text::"shiftType_new");
ALTER TYPE "shiftType" RENAME TO "shiftType_old";
ALTER TYPE "shiftType_new" RENAME TO "shiftType";
DROP TYPE "shiftType_old";
COMMIT;
