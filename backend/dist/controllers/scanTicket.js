"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const zod_1 = __importDefault(require("zod"));
// import { PrismaClient } from "@prisma/client";
const client_1 = require("@prisma/client");
const dotenv_1 = __importDefault(require("dotenv"));
const authMiddleware_1 = __importDefault(require("../middlewares/authMiddleware"));
dotenv_1.default.config();
const ticketScanRouter = express_1.default.Router();
const prisma = new client_1.PrismaClient();
const scanTicketSchema = zod_1.default.object({
    ticketNumber: zod_1.default.string(),
    sessionType: zod_1.default.enum(["Opening", "Closing"]),
    ticketLotNumber: zod_1.default.string(),
    userId: zod_1.default.string(),
});
// add scan ticket
const addScanTicket = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    const body = req.body;
    const { success } = scanTicketSchema.safeParse(body);
    if (!success) {
        res.json({
            message: "Invalid inputs"
        });
    }
    console.log("before adding scan ticket..");
    const ticket = yield prisma.scanTicket.create({
        data: {
            ticketNumber: body.ticketNumber,
            sessionType: body.sessionType,
            ticketLotNumber: body.ticketLotNumber,
            userId: body.userId
        }
    });
    console.log("scan ticket inserted..");
    res.status(200).json({
        ticket_id: ticket.id,
        message: "ticket added successfully"
    });
});
// add scanned batch
const addScanBatch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    const { tickets } = req.body;
    if (!Array.isArray(tickets) || tickets.length === 0) {
        res.status(400).json({ message: "No tickets provided." });
        return;
    }
    if (!userId) {
        res.status(400).json({ message: "Invalid userId.." });
        return;
    }
    try {
        const created = yield prisma.scanTicket.createMany({
            data: tickets.map((t) => ({
                ticketNumber: t.ticketNumber,
                ticketLotNumber: t.ticketLotNumber,
                sessionType: t.sessionType,
                userId
            }))
        });
        res.status(200).json({
            message: "Scan tickets batch added successfully.",
            count: created.count,
        });
    }
    catch (error) {
        console.error("Batch insert failed:", error);
        res.status(500).json({ message: "Failed to insert scan tickets batch." });
    }
});
//delete scan ticket
const deleteScanTicket = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    console.log("body from delete scan: ", body.id);
    const existScanTicket = yield prisma.scanTicket.findUnique({
        where: { id: body.id }
    });
    console.log("log of existing ticket", existScanTicket);
    if (!existScanTicket) {
        res.status(400).json({
            message: `Scan Ticket not found for userId: ${body.id}`,
        });
        return;
    }
    console.log("before deleting..");
    yield prisma.scanTicket.delete({ where: { id: body.id } });
    console.log("deleted..");
    res.status(200).json({
        message: "deleted success"
    });
});
//delete scanned batch
const deleteScanBatch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    const { sessionType } = req.body;
    console.log("got this userId: ", userId);
    console.log("got this sessions: ", sessionType);
    if (!sessionType || !userId) {
        res.status(400).json({
            message: "UserId/Session null.."
        });
        return;
    }
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    console.log("before deleting the scanned Batch..");
    yield prisma.scanTicket.deleteMany({
        where: {
            userId,
            sessionType,
            scannedAt: {
                gte: startOfDay,
                lte: endOfDay
            }
        }
    });
    console.log("Delete scanned batch..");
    res.status(200).json({
        message: "Delete scanned batch successfully!"
    });
});
//get scan ticket
const getScanTicket = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.query;
    if (typeof id !== 'string') {
        res.status(400).json({ message: 'Invalid or missing id query parameter' });
        return;
    }
    const existScanTicket = yield prisma.scanTicket.findUnique({
        where: { id }
    });
    if (!existScanTicket) {
        res.status(400).json({
            message: `Scan Ticket not found for userId: ${id}`,
        });
        return;
    }
    res.status(200).json({
        id: existScanTicket.id,
        ticketNumber: existScanTicket.ticketNumber,
        sessionType: existScanTicket.sessionType,
        sacnnedAt: existScanTicket.scannedAt,
        ticketLotNumber: existScanTicket.ticketLotNumber,
    });
});
//get most recent scanned ticket batch
const getLastScannedTickets = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    const lastScan = yield prisma.scanTicket.findFirst({
        where: {
            userId
        },
        orderBy: {
            scannedAt: 'desc'
        }
    });
    if (!lastScan) {
        res.status(200).json({
            message: "No previous scannes found..",
            tickets: []
        });
    }
    const lastSessionType = lastScan === null || lastScan === void 0 ? void 0 : lastScan.sessionType;
    const lastScanDate = (lastScan === null || lastScan === void 0 ? void 0 : lastScan.scannedAt) ? new Date(lastScan.scannedAt) : new Date();
    lastScanDate.setSeconds(0, 0);
    const startOfDay = new Date(lastScanDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(lastScanDate);
    endOfDay.setHours(23, 59, 59, 999);
    const tickets = yield prisma.scanTicket.findMany({
        where: {
            userId,
            sessionType: lastSessionType,
            scannedAt: {
                gte: startOfDay,
                lte: endOfDay,
            }
        },
        include: {
            ticket: true
        }
    });
    console.log("after quering the db: ", tickets);
    res.status(200).json({
        SessionType: lastSessionType,
        scanDate: lastScan === null || lastScan === void 0 ? void 0 : lastScan.scannedAt,
        tickets
    });
});
// get last ticket info
const lastTicketInfo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    const sessionType = req.query.sessionType;
    console.log("got this sessionType: ", sessionType);
    const lastTicket = yield prisma.scanTicket.findFirst({
        where: { userId,
            sessionType
        },
        orderBy: {
            scannedAt: 'desc'
        }
    });
    if (!lastTicket) {
        res.status(400).json({
            message: "No last scannes found..",
        });
    }
    console.log("last ticket info: ", lastTicket);
    res.status(200).json({
        scannedAt: lastTicket === null || lastTicket === void 0 ? void 0 : lastTicket.scannedAt,
        ticketNumber: lastTicket === null || lastTicket === void 0 ? void 0 : lastTicket.ticketNumber,
        SessionType: lastTicket === null || lastTicket === void 0 ? void 0 : lastTicket.sessionType
    });
});
// getting all scanned tickets for user using pagination for scalabilty
const getAllScanTickets = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    const take = parseInt(req.query.take) || 20;
    const cursor = req.query.cursor;
    const sessionType = req.query.sessionType;
    const fromDate = req.query.fromDate;
    const toDate = req.query.toDate;
    const where = { userId };
    if (sessionType)
        where.sessionType = sessionType;
    if (fromDate && toDate) {
        where.scannedAt = {
            gte: new Date(fromDate),
            lte: new Date(toDate + 'T23:59:59.999Z'),
        };
    }
    const results = yield prisma.scanTicket.findMany(Object.assign(Object.assign({ where, orderBy: {
            scannedAt: 'desc'
        }, take: take + 1 }, (cursor ? { cursor: { id: cursor }, skip: 1 } : {})), { include: {
            ticket: true
        } }));
    console.log("redults from get all scans: ", results);
    const hasMore = results.length > take;
    if (hasMore) {
        results.pop();
    }
    res.json({
        data: results,
        nextCursor: hasMore ? results[results.length - 1].id : null
    });
});
ticketScanRouter.post("/addScanTicket", authMiddleware_1.default, addScanTicket);
ticketScanRouter.post("/addScanBatch", authMiddleware_1.default, addScanBatch);
ticketScanRouter.post("/deleteScanTicket", authMiddleware_1.default, deleteScanTicket);
ticketScanRouter.post("/deleteScanBatch", authMiddleware_1.default, deleteScanBatch);
ticketScanRouter.get("/getScanTicket", authMiddleware_1.default, getScanTicket);
ticketScanRouter.get("/getLastScanTickets", authMiddleware_1.default, getLastScannedTickets);
ticketScanRouter.get("/getLastTicketInfo", authMiddleware_1.default, lastTicketInfo);
ticketScanRouter.get("/getAllScanTickets", authMiddleware_1.default, getAllScanTickets);
exports.default = ticketScanRouter;
