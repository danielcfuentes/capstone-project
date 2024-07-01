-- CreateTable
CREATE TABLE "User" (
    "user" TEXT NOT NULL,
    "hashedPassword" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("user")
);
