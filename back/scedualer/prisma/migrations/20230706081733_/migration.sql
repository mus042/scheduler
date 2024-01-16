/*
  Warnings:

  - The primary key for the `shift_statistic` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `shift_statistic` table. All the data in the column will be lost.
  - Added the required column `status` to the `userRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "shift_statistic" DROP CONSTRAINT "shift_statistic_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "shift_statistic_pkey" PRIMARY KEY ("userId", "scheduleId");

-- AlterTable
ALTER TABLE "userRequest" ADD COLUMN     "status" TEXT NOT NULL,
ALTER COLUMN "requestAnswer" SET DATA TYPE TEXT;
