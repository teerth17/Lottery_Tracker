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

// add scanned batch
const addScanBatch: RequestHandler = async(req: Request,res:Response) => {
    const userId = req.userId;
    const {tickets} = req.body;

    if (!Array.isArray(tickets) || tickets.length === 0) {
         res.status(400).json({ message: "No tickets provided." });
         return
      }

    if(!userId){
        res.status(400).json({message: "Invalid userId.."})
        return
    }

      try{
        const created = await prisma.scanTicket.createMany({
            data: tickets.map((t) =>({
                ticketNumber: t.ticketNumber,
                ticketLotNumber: t.ticketLotNumber,
                sessionType: t.sessionType,
                userId 
            }))
        })
        
        res.status(200).json({
            message: "Scan tickets batch added successfully.",
            count: created.count,
          });

        } catch (error) {
          console.error("Batch insert failed:", error);
          res.status(500).json({ message: "Failed to insert scan tickets batch." });
        }
}

//delete scan ticket
const deleteScanTicket : RequestHandler = async(req:Request,res:Response) => {
    const body = req.body;
    console.log("body from delete scan: ", body.id);

    const existScanTicket = await prisma.scanTicket.findUnique({
        where: {id:body.id}
    })

    console.log("log of existing ticket", existScanTicket);

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

//delete scanned batch
const deleteScanBatch: RequestHandler = async(req:Request,res:Response) => {
    const userId = req.userId;
    const {sessionType} = req.body;

    console.log("got this userId: ",userId);
    console.log("got this sessions: ", sessionType);

   if(!sessionType || !userId){
    res.status(400).json({
        message: "UserId/Session null.."
    })
    return
   }
    const startOfDay = new Date()
    startOfDay.setHours(0,0,0,0);

    const endOfDay = new Date()
    endOfDay.setHours(23,59,59,999);
    
    
    console.log("before deleting the scanned Batch..")
    await prisma.scanTicket.deleteMany({
        where: {
            userId,
            sessionType,
            scannedAt: {
                gte: startOfDay,
                lte: endOfDay
            }
        }
    })

    console.log("Delete scanned batch..")
    res.status(200).json({
        message: "Delete scanned batch successfully!"
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

// get last ticket info
const lastTicketInfo: RequestHandler = async (req:Request,res:Response) =>{
    const userId = req.userId;
    const sessionType = req.query.sessionType as "Opening" | "Closing";

    console.log("got this sessionType: ", sessionType)

    const lastTicket = await prisma.scanTicket.findFirst({
        where: {userId,
            sessionType
        },
        orderBy: {
            scannedAt: 'desc'
        }
    })

    if(!lastTicket){
        res.status(400).json({
            message: "No last scannes found..",
        })
    }

    console.log("last ticket info: ", lastTicket);

    res.status(200).json({
        scannedAt: lastTicket?.scannedAt,
        ticketNumber: lastTicket?.ticketNumber,
        SessionType: lastTicket?.sessionType
    })
} 

// getting all scanned tickets for user using pagination for scalabilty
const getAllScanTickets:RequestHandler = async (req:Request,res:Response) => {
    const userId = req.userId
    const take = parseInt(req.query.take as string) || 20;
    const cursor = req.query.cursor as string | undefined;
    const sessionType = req.query.sessionType as string | undefined;
    const fromDate = req.query.fromDate as string | undefined;
    const toDate = req.query.toDate as string | undefined;

    const where: any = {userId};
    if(sessionType) where.sessionType = sessionType
    if(fromDate && toDate){
        where.scannedAt = {
            gte: new Date(fromDate),
            lte: new Date(toDate + 'T23:59:59.999Z'),
        }
    }    

    const results = await prisma.scanTicket.findMany({
        where,
        orderBy: {
            scannedAt: 'desc'
        },
        take: take+1,
        ...(cursor? {cursor: {id: cursor},skip: 1}: {}),
        include: {
            ticket:true
        }

    })

    console.log("redults from get all scans: ", results)

    const hasMore = results.length > take
    if(hasMore){
        results.pop()
    }

    res.json({
        data: results,
        nextCursor: hasMore? results[results.length -1].id : null
    })

}

ticketScanRouter.post("/addScanTicket",authMiddleware,addScanTicket);
ticketScanRouter.post("/addScanBatch", authMiddleware,addScanBatch);
ticketScanRouter.post("/deleteScanTicket",authMiddleware,deleteScanTicket);
ticketScanRouter.post("/deleteScanBatch", authMiddleware,deleteScanBatch);
ticketScanRouter.get("/getScanTicket",authMiddleware,getScanTicket);
ticketScanRouter.get("/getLastScanTickets",authMiddleware,getLastScannedTickets)
ticketScanRouter.get("/getLastTicketInfo", authMiddleware,lastTicketInfo);
ticketScanRouter.get("/getAllScanTickets",authMiddleware,getAllScanTickets);


export default ticketScanRouter;