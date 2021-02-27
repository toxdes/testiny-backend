import jwt from "jsonwebtoken";
import { err } from "../server";

import { JWT_SECRET } from "../config/constants";
import { Request, Response } from "express";

/*
Authentication - Identify who is Using the Application.
Authorization - What permissions/access does the authenticated user have
*/

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
