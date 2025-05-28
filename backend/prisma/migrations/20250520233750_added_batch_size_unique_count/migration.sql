/*
  Warnings:

  - The primary key for the `Ticket` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `ticketUniqueCount` to the `ScanTicket` table without a default value. This is not possible if the table is not empty.
  - Added the required column `batchSize` to the `Ticket` table without a default value. This is not possible if the table is not empty.
  - Added the required column `uniqueCount` to the `Ticket` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ScanTicket" DROP CONSTRAINT "ScanTicket_userId_ticketLotNumber_fkey";

-- AlterTable
ALTER TABLE "ScanTicket" ADD COLUMN     "ticketUniqueCount" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Ticket" DROP CONSTRAINT "Ticket_pkey",
ADD COLUMN     "batchSize" INTEGER NOT NULL,
ADD COLUMN     "uniqueCount" INTEGER NOT NULL,
ADD CONSTRAINT "Ticket_pkey" PRIMARY KEY ("userId", "lotNumber", "uniqueCount");

-- AddForeignKey
ALTER TABLE "ScanTicket" ADD CONSTRAINT "ScanTicket_userId_ticketLotNumber_ticketUniqueCount_fkey" FOREIGN KEY ("userId", "ticketLotNumber", "ticketUniqueCount") REFERENCES "Ticket"("userId", "lotNumber", "uniqueCount") ON DELETE RESTRICT ON UPDATE CASCADE;
