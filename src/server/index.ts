import express from "express";
import { PrismaClient } from "@prisma/client";
import { authenticateToken } from "../auth/helpers";

export const app = express();
app.use(express.json());
app.use(authenticateToken);
import "../auth";

export const prisma = new PrismaClient();
export const okay = (f: any) => {
  f()
    .catch((e: any) => {
      throw e;
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
};

export const err = (message: string, extraOptions?: any) => {
  return JSON.stringify({
    error: true,
    status: "error",
    message: message,
    ...extraOptions,
  });
};
