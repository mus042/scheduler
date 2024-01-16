-- CreateEnum
CREATE TYPE "typeOfShift" AS ENUM ('short', 'long');

-- CreateEnum
CREATE TYPE "typeOfUser" AS ENUM ('admin', 'headOfLocation', 'headOfShift', 'veteren', 'mid', 'new');

-- AlterTable
ALTER TABLE "shift" ADD COLUMN     "typeOfShift" "typeOfShift";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "typeOfUser" "typeOfUser" NOT NULL DEFAULT 'new';
