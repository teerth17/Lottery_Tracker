import express from "express";
import cors from "cors";
import mainRouter from "./routes/index";
import dotenv from 'dotenv';
dotenv.config();



const port = 3000;
const app = express();

const corsOptions = {
    origin: [
      'http://localhost:5173', // Your local development frontend
      'https://lottery-tracker-five.vercel.app', // Your Vercel frontend
      'http://13.218.58.81:3000' // Your backend itself
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  };

app.use(express.json());
app.use(cors(corsOptions))
app.use("/api/v1",mainRouter)


app.listen(port,'0.0.0.0', () => {
    console.log(`Listening to port ${port}`)
})
