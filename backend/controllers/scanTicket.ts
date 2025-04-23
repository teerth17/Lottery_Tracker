import express from "express";
import cors from "cors";
import z, { string } from "zod";
// import { PrismaClient } from "@prisma/client";

import { PrismaClient, SessionType } from "@prisma/client";
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
    userId: z.string(),
})


// add scan ticket
const addScanTicket :RequestHandler = async (req:Request,res:Response) => {
    const userId = req.userId;
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
            ticketLotNumber: body.ticketLotNumber,
            userId: body.userId
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
    const {id} = req.query;

    if (typeof id !== 'string') {
        res.status(400).json({ message: 'Invalid or missing id query parameter' });
        return
      }
    

    const existScanTicket = await prisma.scanTicket.findUnique({
        where: {id}
    })

    if(!existScanTicket){
        res.status(400).json({
            message: `Scan Ticket not found for userId: ${id}`, 
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

//get most recent scanned ticket batch

const getLastScannedTickets: RequestHandler = async(req:Request,res:Response) => {
    const userId = req.userId;
    
    const lastScan = await prisma.scanTicket.findFirst({
        where: {
            userId
        },
        orderBy: {
            scannedAt: 'desc'
        }
    })

    if(!lastScan){
        res.status(200).json({
            message: "No previous scannes found..",
            tickets: []
        })
    }

    const lastSessionType = lastScan?.sessionType;
    const lastScanDate = lastScan?.scannedAt ? new Date(lastScan.scannedAt) : new Date();
    lastScanDate.setSeconds(0,0);

    const startOfDay = new Date(lastScanDate);
    startOfDay.setHours(0,0,0,0);

    const endOfDay = new Date(lastScanDate);
    endOfDay.setHours(23,59,59,999);

    const tickets = await prisma.scanTicket.findMany({
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
    })

    console.log("after quering the db: ", tickets);

    res.status(200).json({
        SessionType: lastSessionType,
        scanDate: lastScan?.scannedAt,
        tickets
    })
    
}

ticketScanRouter.post("/addScanTicket",authMiddleware,addScanTicket);
ticketScanRouter.post("/deleteScanTicket",authMiddleware,deleteScanTicket);
ticketScanRouter.get("/getScanTicket",authMiddleware,getScanTicket);
ticketScanRouter.get("/getLastScanTicket",authMiddleware,getLastScannedTickets)

export default ticketScanRouter;