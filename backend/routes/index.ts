import express from "express";
import cors from "cors";
import userRouter from "../controllers/user" 

const mainRouter = express.Router();
mainRouter.use("/user",userRouter)

export default mainRouter;