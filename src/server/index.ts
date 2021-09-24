import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import {
  authenticateToken,
  delayResponse,
  customResponseHeaders,
} from "./helpers";
import { DATABASE_URL } from "../config/constants";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
const env_vars = dotenv.config();
import "../../scripts/emailTest";
console.log("Environment Variables (from .env): ", env_vars);
// TODO: Implement proper HTTP Status Codes
// @body Currently, even if there's an error, we send the client status 200, and inform the user about the error, by sending field with error:true, and the error message. So, it's not utilizing the status codes such as 401, 405, 404 etc.
export const app = express();
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.set("trust proxy", 1);
app.use(express.json());
app.use(limiter);
app.use(cors());
app.use(customResponseHeaders);
app.use(authenticateToken);
app.use(delayResponse);
import "../auth";
import "../routes";

// https://www.prisma.io/docs/reference/api-reference/prisma-client-reference#datasources
// overriding DATABASE_URL in case of production
export const prisma = new PrismaClient({
  datasources: {
    db: { url: DATABASE_URL },
  },
});
