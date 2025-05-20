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
const authMiddleware_1 = __importDefault(require("../middlewares/authMiddleware"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const newTicketRouter = express_1.default.Router();
const prisma = new client_1.PrismaClient();
const newTicketSchema = zod_1.default.object({
    lotNumber: zod_1.default.string(),
    name: zod_1.default.string(),
    price: zod_1.default.number(),
    lotHint: zod_1.default.string(),
});
const updateTicketSchema = zod_1.default.object({
    lotNumber: zod_1.default.string(),
    name: zod_1.default.string().optional(),
    price: zod_1.default.number().optional(),
});
//add new ticket
const addNewTicket = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    const userId = String(req.userId);
    console.log("id: ", userId);
    console.log(body);
    const { success, error } = newTicketSchema.safeParse(body);
    if (!success) {
        res.json({
            message: "incorrect inputs inside body..",
        });
    }
    const existingTicket = yield prisma.ticket.findUnique({
        where: {
            userId_lotNumber: {
                userId,
                lotNumber: body.lotNumber
            }
        }
    });
    if (existingTicket) {
        res.status(400).json({
            message: `Ticket is already added for userId: ${body.userId}`,
        });
        return;
    }
    console.log("no existing ticketm,entering to ticket db..");
    yield prisma.ticket.create({
        data: {
            lotNumber: body.lotNumber,
            name: body.name,
            price: body.price,
            userId: userId,
            lotHint: body.lotHint
        }
    });
    console.log("after inserting ticket log..");
    res.status(201).json({
        message: "Ticket inserted successfully",
    });
    return;
});
// get all tickets
const getAllTicketsByUserId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    if (!userId) {
        res.status(400).json({ message: "User ID is missing or invalid." });
        return;
    }
    console.log("before getting all tickets..");
    const tickets = yield prisma.ticket.findMany({
        where: { userId }
    });
    if (!tickets) {
        res.json({
            message: "No tickets found.."
        });
    }
    res.json({
        ticket: tickets.map(ticket => ({
            lotNumber: ticket.lotNumber,
            name: ticket.name,
            price: ticket.price,
        }))
    });
});
//get specfic ticket info
const getTicketByLotNumber = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    const body = req.body;
    console.log("body: ", body);
    if (!userId) {
        res.status(400).json({ message: "User ID is missing or invalid." });
        return;
    }
    const ticket = yield prisma.ticket.findUnique({
        where: {
            userId_lotNumber: {
                userId,
                lotNumber: body.lotNumber
            }
        }
    });
    if (!ticket) {
        res.json({
            message: "No tickets found.."
        });
    }
    res.status(201).json({
        lotNumber: ticket === null || ticket === void 0 ? void 0 : ticket.lotNumber,
        name: ticket === null || ticket === void 0 ? void 0 : ticket.name,
        price: ticket === null || ticket === void 0 ? void 0 : ticket.price,
        message: "fetched the ticket successfully"
    });
});
//get ticket by lotHint
const getTicketByLotHint = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("enterd...");
    const userId = req.userId;
    const { lotHint } = req.query;
    console.log("lotHint: ", lotHint);
    if (!userId) {
        res.status(400).json({ message: "User ID is missing or invalid." });
        return;
    }
    if (!lotHint) {
        res.status(400).json({ message: "LotHint is missing" });
        return;
    }
    const ticket = yield prisma.ticket.findFirst({
        where: {
            lotHint: lotHint,
            userId: userId
        }
    });
    console.log("ticket: ", ticket);
    if (!ticket) {
        res.status(404).json({
            lotHint: lotHint,
            message: "No ticket found with the provided hint."
        });
        return;
    }
    res.status(200).json({
        lotNumber: ticket.lotNumber,
        name: ticket.name,
        price: ticket.price,
        lotHint: ticket.lotHint,
        message: "Fetched the ticket successfully."
    });
});
// update a ticket
const updateTicket = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    const body = req.body;
    console.log("body:", req.body);
    if (!userId) {
        res.status(400).json({ message: "User ID is missing or invalid." });
        return;
    }
    const { success } = updateTicketSchema.safeParse(body);
    if (!success) {
        res.json({
            message: "Error parsing the body",
        });
    }
    const existingTicket = yield prisma.ticket.findUnique({
        where: {
            userId_lotNumber: {
                userId,
                lotNumber: body.lotNumber
            }
        }
    });
    if (!existingTicket) {
        res.status(400).json({
            message: `Ticket not found for userId: ${body.userId}`,
        });
        return;
    }
    console.log("before updating ticket info..");
    yield prisma.ticket.update({
        where: {
            userId_lotNumber: {
                userId,
                lotNumber: body.lotNumber
            }
        },
        data: Object.assign(Object.assign({}, (body.name && { name: body.name })), (body.price && { price: body.price }))
    });
    res.json({
        message: "Ticket info updated succesfully.."
    });
});
//delete ticket by number
const deleteTicket = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    const body = req.body;
    if (!userId) {
        res.status(400).json({ message: "User ID is missing or invalid." });
        return;
    }
    const existingTicket = yield prisma.ticket.findUnique({
        where: {
            userId_lotNumber: {
                userId,
                lotNumber: body.lotNumber
            }
        }
    });
    if (!existingTicket) {
        res.status(400).json({
            message: `Ticket not found for userId: ${body.userId}`,
        });
        return;
    }
    console.log("before deleting..");
    yield prisma.ticket.delete({
        where: {
            userId_lotNumber: {
                userId,
                lotNumber: body.lotNumber
            }
        }
    });
    console.log("delted");
    res.status(200).json({
        message: "ticket deleted success"
    });
});
newTicketRouter.get("/getAllTickets", authMiddleware_1.default, getAllTicketsByUserId);
newTicketRouter.get("/getTicket", authMiddleware_1.default, getTicketByLotNumber);
newTicketRouter.get("/getTicketByLotHint", authMiddleware_1.default, getTicketByLotHint);
newTicketRouter.post("/addNewTicket", authMiddleware_1.default, addNewTicket);
newTicketRouter.put("/updateTicket", authMiddleware_1.default, updateTicket);
newTicketRouter.post("/deleteTicket", authMiddleware_1.default, deleteTicket);
exports.default = newTicketRouter;
