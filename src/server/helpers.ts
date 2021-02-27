import jwt from "jsonwebtoken";
import validator from "validator";

import { JWT_SECRET } from "../config/constants";
import { prisma } from ".";

import { Request, Response } from "express";

/*
Authentication - Identify who is Using the Application.
Authorization - What permissions/access does the authenticated user have
*/

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

export const authenticateToken = (
  req: Request,
  res: Response,
  next: () => void
) => {
  const header = req.headers["authorization"];
  const token = header?.split(" ")[1];
  if (!token || header?.split(" ")[0] !== "Bearer") {
    (req as any).user = undefined;
    next();
    return;
  }
  jwt.verify(token, JWT_SECRET, (error, userId) => {
    if (error) {
      return res.status(401).send(err("invalid token")).end();
    }
    (req as any).userId = userId;
    next();
  });
};

export const generateToken = (userId: string) => {
  return jwt.sign(userId, JWT_SECRET);
};

export const sanitizeInput = (input?: string) => {
  input = input + "";
  return validator.escape(input);
};

export const isUsername = (input?: string) => {
  if (!input) return false;
  return /^[A-Za-z0-9_]+$/.test(input);
};

export const isEmpty = (selector: string, fields: string[]) => {
  if (selector === "any") {
    return fields?.some((f) => validator.isEmpty(f));
  }
  if (selector === "all") {
    return fields?.every((f) => validator.isEmpty(f));
  }
  return true;
};
