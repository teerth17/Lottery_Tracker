-- CreateIndex
CREATE INDEX "ScanTicket_userId_scannedAt_idx" ON "ScanTicket"("userId", "scannedAt");

-- CreateIndex
CREATE INDEX "ScanTicket_userId_sessionType_scannedAt_idx" ON "ScanTicket"("userId", "sessionType", "scannedAt");
