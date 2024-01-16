/*
  Warnings:

  - The values [toSend] on the enum `requestStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "requestStatus_new" AS ENUM ('pending', 'sent', 'recived');
ALTER TABLE "userRequest" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "userRequest" ALTER COLUMN "status" TYPE "requestStatus_new" USING ("status"::text::"requestStatus_new");
ALTER TYPE "requestStatus" RENAME TO "requestStatus_old";
ALTER TYPE "requestStatus_new" RENAME TO "requestStatus";
DROP TYPE "requestStatus_old";
ALTER TABLE "userRequest" ALTER COLUMN "status" SET DEFAULT 'pending';
COMMIT;

-- AlterTable
ALTER TABLE "userRequest" ALTER COLUMN "status" SET DEFAULT 'pending';
