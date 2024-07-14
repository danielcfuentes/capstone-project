/*
  Warnings:

  - Made the column `elevationGain` on table `ActiveRun` required. This step will fail if there are existing NULL values in that column.
  - Made the column `elevationLoss` on table `ActiveRun` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "ActiveRun" ADD COLUMN     "averagePace" DOUBLE PRECISION,
ADD COLUMN     "estimatedCaloriesBurned" INTEGER,
ALTER COLUMN "elevationGain" SET NOT NULL,
ALTER COLUMN "elevationLoss" SET NOT NULL;
