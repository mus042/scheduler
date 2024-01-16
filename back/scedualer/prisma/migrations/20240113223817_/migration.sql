-- CreateTable
CREATE TABLE "ScheduleMold" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL DEFAULT 'deafult Settings',
    "description" TEXT,
    "startDay" INTEGER NOT NULL,
    "startHour" TEXT NOT NULL,
    "endDay" INTEGER NOT NULL,
    "endHour" TEXT NOT NULL,
    "daysPerSchedule" INTEGER NOT NULL,
    "selected" BOOLEAN NOT NULL,
    "organizationId" INTEGER NOT NULL,

    CONSTRAINT "ScheduleMold_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShiftMold" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "startHour" TEXT NOT NULL,
    "endHour" TEXT NOT NULL,
    "day" INTEGER NOT NULL,
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

-- CreateIndex
CREATE UNIQUE INDEX "ScheduleMold_selected_key" ON "ScheduleMold"("selected");

-- CreateIndex
CREATE UNIQUE INDEX "Rank_name_key" ON "Rank"("name");

-- AddForeignKey
ALTER TABLE "ScheduleMold" ADD CONSTRAINT "ScheduleMold_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShiftMold" ADD CONSTRAINT "ShiftMold_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "ScheduleMold"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPreference" ADD CONSTRAINT "UserPreference_shiftMoldId_fkey" FOREIGN KEY ("shiftMoldId") REFERENCES "ShiftMold"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPreference" ADD CONSTRAINT "UserPreference_rankId_fkey" FOREIGN KEY ("rankId") REFERENCES "Rank"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
