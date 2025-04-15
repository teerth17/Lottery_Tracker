"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_1 = __importDefault(require("../controllers/user"));
const newTickets_1 = __importDefault(require("../controllers/newTickets"));
const scanTicket_1 = __importDefault(require("../controllers/scanTicket"));
const mainRouter = express_1.default.Router();
mainRouter.use("/user", user_1.default);
mainRouter.use("/user/newTicket", newTickets_1.default);
mainRouter.use("/user/scanTicket", scanTicket_1.default);
exports.default = mainRouter;
