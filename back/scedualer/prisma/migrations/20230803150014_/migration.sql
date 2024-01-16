-- DropForeignKey
ALTER TABLE "shift_statistic" DROP CONSTRAINT "shift_statistic_schedule_id_fkey";

-- DropForeignKey
ALTER TABLE "shift_statistic" DROP CONSTRAINT "shift_statistic_user_id_fkey";

-- AddForeignKey
ALTER TABLE "shift_statistic" ADD CONSTRAINT "shift_statistic_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shift_statistic" ADD CONSTRAINT "shift_statistic_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "schedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;
