-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_orgId_fkey";

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "orgId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
