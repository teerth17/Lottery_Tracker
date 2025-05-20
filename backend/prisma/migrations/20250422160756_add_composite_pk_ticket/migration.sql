/*
  Warnings:

  - Added the required column `lotHint` to the `Ticket` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "ScanTicket_userId_ticketLotNumber_idx";

-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "lotHint" TEXT NOT NULL;
