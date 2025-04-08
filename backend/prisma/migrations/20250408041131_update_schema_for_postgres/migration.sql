-- CreateEnum
CREATE TYPE "SessionType" AS ENUM ('Opening', 'Closing');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "firstname" TEXT NOT NULL,
    "lastname" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ticket" (
    "lotNumber" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("lotNumber")
);

-- CreateTable
CREATE TABLE "ScanTicket" (
    "id" SERIAL NOT NULL,
    "ticketNumber" TEXT NOT NULL,
    "sessionType" "SessionType" NOT NULL,
    "scannedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ticketLotNumber" TEXT NOT NULL,

    CONSTRAINT "ScanTicket_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScanTicket" ADD CONSTRAINT "ScanTicket_ticketLotNumber_fkey" FOREIGN KEY ("ticketLotNumber") REFERENCES "Ticket"("lotNumber") ON DELETE RESTRICT ON UPDATE CASCADE;
