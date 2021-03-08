import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import { authenticateToken } from "./helpers";

// TODO: Implement proper HTTP Status Codes
// @body Currently, even if there's an error, we send the client status 200, and inform the user about the error, by sending field with error:true, and the error message. So, it's not utilizing the status codes such as 401, 405, 404 etc.
export const app = express();
app.use(express.json());
app.use(cors());
app.use(authenticateToken);
import "../auth";
import "../routes";
export const prisma = new PrismaClient();
