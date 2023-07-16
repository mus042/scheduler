/*
  Warnings:

  - The `status` column on the `userRequest` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "requestStatus" AS ENUM ('toSend', 'sent', 'recived');

-- AlterTable
ALTER TABLE "userRequest" DROP COLUMN "status",
ADD COLUMN     "status" "requestStatus" NOT NULL DEFAULT 'toSend';
