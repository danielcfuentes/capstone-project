/*
  Warnings:

  - A unique constraint covering the columns `[runId]` on the table `UserActivity` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `runId` to the `UserActivity` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserActivity" ADD COLUMN     "runId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "UserActivity_runId_key" ON "UserActivity"("runId");
