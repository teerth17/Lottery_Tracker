import express from "express";
import cors from "cors";
import mainRouter from "./routes/index";
import dotenv from 'dotenv';
dotenv.config();



const port = 3000;
const app = express();


app.use(express.json());
app.use(cors())
app.use("/api/v1",mainRouter)


app.listen(port, () => {
    console.log(`Listening to port ${port}`)
})
