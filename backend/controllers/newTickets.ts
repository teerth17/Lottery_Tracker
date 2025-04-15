import express from "express";
import cors from "cors";
import z, { string } from "zod";
// import { PrismaClient } from "@prisma/client";

import { PrismaClient } from "@prisma/client";
import { Request, Response,RequestHandler } from "express";
import authMiddleware from "../middlewares/authMiddleware";
import jwt from "jsonwebtoken";
import { env } from "process";
import bcrypt from "bcrypt";
import dotenv from 'dotenv';
dotenv.config();

const newTicketRouter = express.Router();
const prisma = new PrismaClient();

type NewTicketRequestBody = {
    lotNumber: string,
    name: string,
    price: number,
    userId: string
}

const newTicketSchema = z.object({
    lotNumber: z.string(),
    name: z.string(),
    price: z.number(),
})

const updateTicketSchema = z.object({
    lotNumber:z.string(),
    name: z.string().optional(),
    price: z.number().optional(),
})

//add new ticket
const addNewTicket: RequestHandler = async (req: Request, res: Response) => {
    const body: NewTicketRequestBody = req.body;
    const userId = String(req.userId);
   
    console.log("id: ",userId);
    console.log(body);

    const {success,error} = newTicketSchema.safeParse(body);

    if(!success){
        res.json({
            message: "incorrect inputs inside body..",
        })
    }

    const existingTicket = await prisma.ticket.findUnique({
        where: {lotNumber: body.lotNumber, userId} 
    })

    if(existingTicket){
        res.status(400).json({
            message: `Ticket is already added for userId: ${body.userId}`, 
        })
        return
    }

    console.log("no existing ticketm,entering to ticket db..")
    await prisma.ticket.create({
        data: {
            lotNumber:body.lotNumber,
            name: body.name,
            price: body.price,
            userId: userId,
        }
    })
    console.log("after inserting ticket log..")
    res.status(201).json({
        message: "Ticket inserted successfully",
    });
    return
}

// get all tickets
const getAllTicketsByUserId: RequestHandler = async(req:Request,res:Response) => {
    const userId = req.userId;

    console.log("before getting all tickets..")

    const tickets = await prisma.ticket.findMany({
        where: {userId}
    })

    if(!tickets){
        res.json({
            message: "No tickets found.."
        })
    }

    res.json({
       ticket: tickets.map(ticket => ({
        lotNumber: ticket.lotNumber,
        name:ticket.name,
        price:ticket.price,
       })) 
    })

} 

//get specfic ticket info
const getTicketByLotNumber: RequestHandler = async(req:Request,res:Response) => {
    const userId = req.userId;
    const body = req.body;
    console.log("body: ",body);

    const ticket = await prisma.ticket.findUnique({
        where: {
            lotNumber: body.lotNumber
        }
    })

    if(!ticket){
        res.json({
            message: "No tickets found.."
        })
    }

    res.status(201).json({
        lotNumber: ticket?.lotNumber,
        name: ticket?.name,
        price: ticket?.price,
        message: "fetched the ticket successfully"
    })
}

// update a ticket
const updateTicket: RequestHandler = async(req:Request,res:Response) => {
    const userId = req.userId;
    const body = req.body;
    console.log("body:",req.body);
    const {success} = updateTicketSchema.safeParse(body);

    if(!success){
        res.json({
            message: "Error parsing the body",
        })
    }

    const existingTicket = await prisma.ticket.findUnique({
        where: {lotNumber: body.lotNumber, userId} 
    })

    if(!existingTicket){
        res.status(400).json({
            message: `Ticket not found for userId: ${body.userId}`, 
        })
        return
    }

    console.log("before updating ticket info..")
    await prisma.ticket.update({
        where: {
            lotNumber:body.lotNumber,
            userId
        },
        data: {
            ...(body.name && { name: body.name }),
            ...(body.price && { price: body.price }),
        }
    })
    
    res.json({
        message: "Ticket info updated succesfully.."
    })

}

//delete ticket by number
const deleteTicket :RequestHandler = async (req:Request,res:Response) => {
    const userId = req.userId;
    const body = req.body;

    const existingTicket = await prisma.ticket.findUnique({
        where: {lotNumber: body.lotNumber, userId} 
    })

    if(!existingTicket){
        res.status(400).json({
            message: `Ticket not found for userId: ${body.userId}`, 
        })
        return
    }

    console.log("before deleting..")

    await prisma.ticket.delete({
        where: {lotNumber:body.lotNumber, userId}
    })

    console.log("delted")

    res.status(200).json({
        message: "ticket deleted success"
    })
}

newTicketRouter.get("/getAllTickets",authMiddleware,getAllTicketsByUserId);
newTicketRouter.get("/getTicket",authMiddleware,getTicketByLotNumber);
newTicketRouter.post("/addNewTicket", authMiddleware, addNewTicket);
newTicketRouter.put("/updateTicket",authMiddleware,updateTicket);
newTicketRouter.post("/deleteTicket",authMiddleware, deleteTicket);

export default newTicketRouter;