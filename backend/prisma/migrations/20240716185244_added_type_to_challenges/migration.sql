/*
  Warnings:

  - You are about to drop the column `isCompleted` on the `Challenge` table. All the data in the column will be lost.
  - Added the required column `expiresAt` to the `Challenge` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Challenge` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Challenge" DROP COLUMN "isCompleted",
ADD COLUMN     "expiresAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'active',
ADD COLUMN     "type" TEXT NOT NULL;
