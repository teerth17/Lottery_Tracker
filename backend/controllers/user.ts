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
import { lstat } from "fs";
import authMiddleware from "../middlewares/authMiddleware";
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

const updateUserSchema = z.object({
    firstname: z.string().optional(),
    lastname: z.string().optional(),
    passwod: z.string().optional(),
})


type SignupRequestBody = {
    email: string;
    firstname: string;
    lastname: string;
    password:string;
}

type SigninRequestBody = {
    email: string;
    password: string;
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

const signinHandler: RequestHandler = async (req: Request, res:Response) => {
    const body: SigninRequestBody = req.body;
    console.log(body);

    const existingUser = await prisma.user.findUnique({
        where: {email: body.email},
    })

    if(!existingUser){
        res.status(400).json({
            message: "User email not registered..",
        })
        return;
    }

    const isPasswordValid = await bcrypt.compare(body.password,existingUser.password); 
    if(!isPasswordValid){
        res.status(401).json({
            message: "Invalid Password..",
        })
        return;
    }
    
    const token = jwt.sign({userId:existingUser.id},JWT_SECRET);
    res.json({
        userId: existingUser.id,
        message: "User signed in successfully..",
        token: token,
    })
}


// update user info
const updateUserInfoById :RequestHandler = async (req:Request,res:Response) => {
    const userId = req.userId;
    const body = req.body;

    const {success} = updateUserSchema.safeParse(body);

    if(!success){
        res.json({
            message: "incorrect inputs",
        })
    }

    console.log("before updating user info");

    await prisma.user.update({
        where: {
            id: userId,
        },
        data: {
            ...(body.firstname && {firtname: body.firstname}),
            ...(body.lastname && {lastname: body.lastname}),
            ...(body.password && {password: body.passwod})
        }
    })

    res.json({
        message: "User info updated successfully"
    })
}

//getallusers
const getAllUsers : RequestHandler = async (req:Request,res:Response) => {
    const userId = req.userId;
    
    const users = await prisma.user.findMany();

    if(!users){
        res.json({
            message: "No user found.."
        })
    }

    res.json({
        user: users.map((user) => ({
            id: user.id,
            firstname: user.firstname,
            lastname: user.lastname,
            createdAt: user.createdAt
        }))
    })
}

//getuserinfo

const getUserInfo : RequestHandler = async(req:Request,res:Response) => {
    const userId = req.userId;

    const user = await prisma.user.findUnique({
        where: {id: userId}
    })

    if(!user){
        res.json({
            message: "USer not found"
        })
    }

    res.json({
        id: user?.id,
        firstname: user?.firstname,
        lastname: user?.lastname,
        createdAt: user?.createdAt
    })
}

//delete user: 

const deleteUser :RequestHandler = async(req:Request,res:Response) => {
    const userId = req.userId;

    console.log("before deleting user..")

    await prisma.user.delete({
        where: {id: userId}
    })

    console.log("deletd user success..")

    res.status(201).json({
        message: "User delted"
    })
}
userRouter.post("/signup",signupHandler);
userRouter.post("/signin",signinHandler);
userRouter.put("/update",authMiddleware,updateUserInfoById);
userRouter.post("/delete",authMiddleware,deleteUser);

export default userRouter;