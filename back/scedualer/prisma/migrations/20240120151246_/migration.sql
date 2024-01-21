-- AlterTable
ALTER TABLE "UserProfile" ADD COLUMN     "phoneNumber" TEXT;

-- AlterTable
ALTER TABLE "shift" ALTER COLUMN "shiftTimeName" DROP NOT NULL;
