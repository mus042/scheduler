-- CreateTable
CREATE TABLE "ScheduleMold" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "start" TIMESTAMP(3) NOT NULL,
    "end" TIMESTAMP(3) NOT NULL,
    "shiftsADay" INTEGER NOT NULL,

    CONSTRAINT "ScheduleMold_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShiftMold" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "startHour" TIMESTAMP(3) NOT NULL,
    "endHour" TIMESTAMP(3) NOT NULL,
    "scheduleId" INTEGER NOT NULL,

    CONSTRAINT "ShiftMold_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPreference" (
    "id" SERIAL NOT NULL,
    "shiftMoldId" INTEGER NOT NULL,
    "rankId" INTEGER NOT NULL,
    "userCount" INTEGER NOT NULL,

    CONSTRAINT "UserPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rank" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Rank_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ShiftMold" ADD CONSTRAINT "ShiftMold_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "ScheduleMold"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPreference" ADD CONSTRAINT "UserPreference_shiftMoldId_fkey" FOREIGN KEY ("shiftMoldId") REFERENCES "ShiftMold"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPreference" ADD CONSTRAINT "UserPreference_rankId_fkey" FOREIGN KEY ("rankId") REFERENCES "Rank"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
