/*
  Warnings:

  - The primary key for the `shift_statistic` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `scheduleId` on the `shift_statistic` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `shift_statistic` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[senderId,destionationUserId,shiftId]` on the table `userRequest` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `schedule_id` to the `shift_statistic` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `shift_statistic` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "shift_statistic" DROP CONSTRAINT "shift_statistic_scheduleId_fkey";

-- DropForeignKey
ALTER TABLE "shift_statistic" DROP CONSTRAINT "shift_statistic_userId_fkey";

-- AlterTable
ALTER TABLE "shift_statistic" DROP CONSTRAINT "shift_statistic_pkey",
DROP COLUMN "scheduleId",
DROP COLUMN "userId",
ADD COLUMN     "schedule_id" INTEGER NOT NULL,
ADD COLUMN     "user_id" INTEGER NOT NULL,
ADD CONSTRAINT "shift_statistic_pkey" PRIMARY KEY ("user_id", "schedule_id");

-- CreateIndex
CREATE UNIQUE INDEX "userRequest_senderId_destionationUserId_shiftId_key" ON "userRequest"("senderId", "destionationUserId", "shiftId");

-- AddForeignKey
ALTER TABLE "userRequest" ADD CONSTRAINT "userRequest_destionationUserId_fkey" FOREIGN KEY ("destionationUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shift_statistic" ADD CONSTRAINT "shift_statistic_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shift_statistic" ADD CONSTRAINT "shift_statistic_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "schedule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
