-- AlterTable
ALTER TABLE "userRequest" ADD COLUMN     "isAprroved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "requestAnswerMsg" TEXT;
