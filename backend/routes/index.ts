import express from "express";
import cors from "cors";
import userRouter from "../controllers/user" 
import newTicketRouter from "../controllers/newTickets"
import ticketScanRouter from "../controllers/scanTicket";


const mainRouter = express.Router();
mainRouter.use("/user",userRouter)
mainRouter.use("/user/newTicket",newTicketRouter);
mainRouter.use("/user/scanTicket",ticketScanRouter);

export default mainRouter;