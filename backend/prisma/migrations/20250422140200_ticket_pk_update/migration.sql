/*
  Warnings:

  - The primary key for the `Ticket` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "ScanTicket" DROP CONSTRAINT "ScanTicket_ticketLotNumber_fkey";

-- AlterTable
ALTER TABLE "ScanTicket" ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "Ticket" DROP CONSTRAINT "Ticket_pkey",
ADD CONSTRAINT "Ticket_pkey" PRIMARY KEY ("userId", "lotNumber");

-- CreateIndex
CREATE INDEX "ScanTicket_userId_ticketLotNumber_idx" ON "ScanTicket"("userId", "ticketLotNumber");

-- AddForeignKey
ALTER TABLE "ScanTicket" ADD CONSTRAINT "ScanTicket_userId_ticketLotNumber_fkey" FOREIGN KEY ("userId", "ticketLotNumber") REFERENCES "Ticket"("userId", "lotNumber") ON DELETE RESTRICT ON UPDATE CASCADE;
