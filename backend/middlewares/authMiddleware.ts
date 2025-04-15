
import { RequestHandler ,Request,Response, NextFunction} from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET as string;

const authMiddleware:RequestHandler = async (req:Request, res:Response,next:NextFunction) => {
    const tokenHeader= req.headers["authorization"] as string|undefined;
    if(!tokenHeader){
        res.status(403).json({
            message: "Unautorized token.."
        })
        return;    
    }

    const token = tokenHeader.split(" ")[1];
    console.log("token: " , token);

    try{
        const decoded = jwt.verify(token,JWT_SECRET) as {userId:string};
        console.log("decoded: " ,decoded);
        req.userId = decoded.userId;
        next();
        
    }catch(err){
         res.status(401).json({
            message: "Invalid token..",
        })
        
    }

    
}

export default authMiddleware;