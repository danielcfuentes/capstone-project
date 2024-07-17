-- CreateTable
CREATE TABLE "ActiveRun" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "startDateTime" TIMESTAMP(3) NOT NULL,
    "distance" DOUBLE PRECISION NOT NULL,
    "elevationGain" DOUBLE PRECISION,
    "elevationLoss" DOUBLE PRECISION,
    "startLatitude" DOUBLE PRECISION NOT NULL,
    "startLongitude" DOUBLE PRECISION NOT NULL,
    "endLatitude" DOUBLE PRECISION NOT NULL,
    "endLongitude" DOUBLE PRECISION NOT NULL,
    "routeCoordinates" TEXT NOT NULL,
    "startLocation" TEXT NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ActiveRun_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ActiveRun" ADD CONSTRAINT "ActiveRun_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
