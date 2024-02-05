/*
  Warnings:

  - A unique constraint covering the columns `[selected,facilityId]` on the table `ScheduleMold` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "ScheduleMold_selected_key";

-- CreateIndex
CREATE UNIQUE INDEX "ScheduleMold_selected_facilityId_key" ON "ScheduleMold"("selected", "facilityId");
