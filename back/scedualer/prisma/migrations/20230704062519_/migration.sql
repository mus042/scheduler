-- CreateTable
CREATE TABLE "shift_statistic" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "morningShifts" INTEGER NOT NULL,
    "nightShifts" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "scheduleId" INTEGER NOT NULL,

    CONSTRAINT "shift_statistic_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "shift_statistic" ADD CONSTRAINT "shift_statistic_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shift_statistic" ADD CONSTRAINT "shift_statistic_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "schedule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
