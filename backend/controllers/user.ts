import express from "express";
import cors from "cors";
import z from "zod";
// import { PrismaClient } from "@prisma/client";

import { PrismaClient } from "@prisma/client";
import { Request, Response,RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { env } from "process";
import bcrypt from "bcrypt";
import dotenv from 'dotenv';
dotenv.config();



const userRouter = express.Router();
const prisma = new PrismaClient();

const JWT_SECRET = env.JWT_SECRET as string;
console.log("JWT_SECRET: " , JWT_SECRET)
console.log("Jwr: " ,JWT_SECRET);

const signupSchema = z.object({
    email: z.string().email(),
    firstname: z.string().min(1),
    lastname: z.string().min(1),
    password: z.string().min(4),
})

type SignupRequestBody = {
    email: string;
    firstname: string;
    lastname: string;
    password:string;
}

// async function testPrisma() {
//     const users = await prisma.user.findMany();
//     console.log(users);
//   }
  
//   testPrisma();

const signupHandler:RequestHandler =  async (req: Request,res: Response) => {
    const body:SignupRequestBody = req.body;
    console.log(body);
    
    const success = signupSchema.safeParse(body);

    if(!success.success){
        res.json({
            message: "incorrect inputs",
        })
    }

    const existingUser = await prisma.user.findUnique({
        where: {email: body.email},
    })

    if(existingUser){
        res.status(400).json({
            message: "Email already taken",
        })
    }

    const hashPassword = await bcrypt.hash(body.password,10);
    const newUser = await prisma.user.create({
        data: {
            email: body.email,
            firstname: body.firstname,
            lastname: body.lastname,
            password: hashPassword,
        }
    })

    console.log("user created..", newUser.id);

    const token = jwt.sign({userId: newUser.id},JWT_SECRET);

    console.log(token);
    
    res.status(201).json({
        userId: newUser.id,
        message: "USer created Successfully",
        token,
    })
}

userRouter.post("/signup",signupHandler);

export default userRouter;