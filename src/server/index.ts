import express from "express";
import { PrismaClient } from "@prisma/client";
import { authenticateToken } from "./helpers";

export const app = express();
app.use(express.json());
app.use(authenticateToken);
import "../auth";

export const prisma = new PrismaClient();
