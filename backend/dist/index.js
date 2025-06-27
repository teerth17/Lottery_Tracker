"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const index_1 = __importDefault(require("./routes/index"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const port = 3000;
const app = (0, express_1.default)();
// const corsOptions = {
//     origin: [
//       'http://localhost:3000/api/v1', // Your local development frontend
//       'https://lottery-tracker-five.vercel.app', // Your Vercel frontend
//       'http://184.73.150.172:3000' // Your backend itself
//     ],
//     credentials: true,
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//     allowedHeaders: ['Content-Type', 'Authorization']
//   };
const corsOptions = {
    origin: [
        'http://localhost:5173', // Vite default dev server
        'http://localhost:3001', // Alternative local port
        'http://localhost:3000', // Another common port
        'https://lottery-tracker-five.vercel.app', // Your Vercel frontend
        'https://transcript-lift-relationship-phd.trycloudflare.com',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(express_1.default.json());
app.use((0, cors_1.default)(corsOptions));
app.use("/api/v1", index_1.default);
app.listen(port, '0.0.0.0', () => {
    console.log(`Listening to port ${port}`);
});
