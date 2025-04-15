import express from "express";
import cors from "cors";
import z, { string } from "zod";
// import { PrismaClient } from "@prisma/client";

import { PrismaClient } from "@prisma/client";
import { Request, Response,RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { env } from "process";
import bcrypt from "bcrypt";
import dotenv from 'dotenv';
import authMiddleware from "../middlewares/authMiddleware";
dotenv.config();

const ticketScanRouter = express.Router();
const prisma = new PrismaClient();


const scanTicketSchema = z.object({
    ticketNumber :z.string(),
    sessionType: z.enum(["Opening", "Closing"]),
    ticketLotNumber: z.string(),
})


// add scan ticket
const addScanTicket :RequestHandler = async (req:Request,res:Response) => {
    const body = req.body;

    const {success} = scanTicketSchema.safeParse(body);

    if(!success){
        res.json({
            message: "Invalid inputs"
        })
    }

    console.log("before adding scan ticket..")

    const ticket = await prisma.scanTicket.create({
        data: {
            ticketNumber: body.ticketNumber,
            sessionType: body.sessionType,
            ticketLotNumber: body.ticketLotNumber
        }
    })

    console.log("scan ticket inserted..")

    res.status(200).json({
        ticket_id:ticket.id, 
        message: "ticket added successfully"
    })
}

//delete scan ticket
const deleteScanTicket : RequestHandler = async(req:Request,res:Response) => {
    const body = req.body;

    const existScanTicket = await prisma.scanTicket.findUnique({
        where: {id:body.id}
    })

    if(!existScanTicket){
        res.status(400).json({
            message: `Scan Ticket not found for userId: ${body.id}`, 
        })
        return
    }

    console.log("before deleting..")

    await prisma.scanTicket.delete({where: {id:body.id}})

    console.log("deleted..")

    res.status(200).json({
        message: "deleted success"
    })
}

//get scan ticket
const getScanTicket :RequestHandler = async(req: Request,res:Response) => {
    const body = req.body;

    const existScanTicket = await prisma.scanTicket.findUnique({
        where: {id:body.id}
    })

    if(!existScanTicket){
        res.status(400).json({
            message: `Scan Ticket not found for userId: ${body.id}`, 
        })
        return
    }

    res.status(200).json({
        id: existScanTicket.id,
        ticketNumber: existScanTicket.ticketNumber,
        sessionType: existScanTicket.sessionType,
        sacnnedAt: existScanTicket.scannedAt,
        ticketLotNumber: existScanTicket.ticketLotNumber,
    })

}

ticketScanRouter.use("/addScanTicket",authMiddleware,addScanTicket);
ticketScanRouter.use("/deleteScanTicket",authMiddleware,deleteScanTicket);
ticketScanRouter.use("/getScanTicket",authMiddleware,getScanTicket);

export default ticketScanRouter;