"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const zod_1 = __importDefault(require("zod"));
// import { PrismaClient } from "@prisma/client";
const client_1 = require("@prisma/client");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const process_1 = require("process");
const bcrypt_1 = __importDefault(require("bcrypt"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const userRouter = express_1.default.Router();
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process_1.env.JWT_SECRET;
console.log("JWT_SECRET: ", JWT_SECRET);
console.log("Jwr: ", JWT_SECRET);
const signupSchema = zod_1.default.object({
    email: zod_1.default.string().email(),
    firstname: zod_1.default.string().min(1),
    lastname: zod_1.default.string().min(1),
    password: zod_1.default.string().min(4),
});
function testPrisma() {
    return __awaiter(this, void 0, void 0, function* () {
        const users = yield prisma.user.findMany();
        console.log(users);
    });
}
testPrisma();
const signupHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    console.log(body);
    const success = signupSchema.safeParse(body);
    if (!success.success) {
        res.json({
            message: "incorrect inputs",
        });
    }
    const existingUser = yield prisma.user.findUnique({
        where: { email: body.email },
    });
    if (existingUser) {
        res.status(400).json({
            message: "Email already taken",
        });
    }
    const hashPassword = yield bcrypt_1.default.hash(body.password, 10);
    const newUser = yield prisma.user.create({
        data: {
            email: body.email,
            firstname: body.firstname,
            lastname: body.lastname,
            password: hashPassword,
        }
    });
    console.log("user created..", newUser.id);
    const token = jsonwebtoken_1.default.sign({ userId: newUser.id }, JWT_SECRET);
    console.log(token);
    res.status(201).json({
        userId: newUser.id,
        message: "USer created Successfully",
        token,
    });
});
userRouter.post("/signup", signupHandler);
exports.default = userRouter;
