import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import { authenticateToken } from "./helpers";

export const app = express();
app.use(express.json());
app.use(cors());
app.use(authenticateToken);
import "../auth";

export const prisma = new PrismaClient();
