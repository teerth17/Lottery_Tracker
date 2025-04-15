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
});
// add scan ticket
const addScanTicket = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
            ticketLotNumber: body.ticketLotNumber
        }
    });
    console.log("scan ticket inserted..");
    res.status(200).json({
        ticket_id: ticket.id,
        message: "ticket added successfully"
    });
});
//delete scan ticket
const deleteScanTicket = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    const existScanTicket = yield prisma.scanTicket.findUnique({
        where: { id: body.id }
    });
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
//get scan ticket
const getScanTicket = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    const existScanTicket = yield prisma.scanTicket.findUnique({
        where: { id: body.id }
    });
    if (!existScanTicket) {
        res.status(400).json({
            message: `Scan Ticket not found for userId: ${body.id}`,
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
ticketScanRouter.use("/addScanTicket", authMiddleware_1.default, addScanTicket);
ticketScanRouter.use("/deleteScanTicket", authMiddleware_1.default, deleteScanTicket);
ticketScanRouter.use("/getScanTicket", authMiddleware_1.default, getScanTicket);
exports.default = ticketScanRouter;
