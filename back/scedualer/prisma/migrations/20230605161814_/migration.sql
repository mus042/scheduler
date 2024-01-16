/*
  Warnings:

  - The values [admin] on the enum `typeOfUser` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('admin', 'user');

-- AlterEnum
BEGIN;
CREATE TYPE "typeOfUser_new" AS ENUM ('headOfLocation', 'headOfShift', 'veteren', 'mid', 'new');
ALTER TABLE "users" ALTER COLUMN "typeOfUser" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "typeOfUser" TYPE "typeOfUser_new" USING ("typeOfUser"::text::"typeOfUser_new");
ALTER TYPE "typeOfUser" RENAME TO "typeOfUser_old";
ALTER TYPE "typeOfUser_new" RENAME TO "typeOfUser";
DROP TYPE "typeOfUser_old";
ALTER TABLE "users" ALTER COLUMN "typeOfUser" SET DEFAULT 'new';
COMMIT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "userRole" "Role" NOT NULL DEFAULT 'user';
