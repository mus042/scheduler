-- CreateTable
CREATE TABLE "userRequest" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "senderId" INTEGER NOT NULL,
    "destionationUserId" INTEGER NOT NULL,
    "isAnswered" BOOLEAN NOT NULL DEFAULT false,
    "requestAnswer" BOOLEAN,
    "requsetMsg" TEXT,
    "shiftId" INTEGER NOT NULL,

    CONSTRAINT "userRequest_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "userRequest" ADD CONSTRAINT "userRequest_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
