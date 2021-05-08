import jwt from "jsonwebtoken";
import validator from "validator";

import { JWT_SECRET, ARTIFICIAL_DELAY_IN_MILLIS } from "../config/constants";
import { prisma } from ".";

import { Request, Response } from "express";

/*
Authentication - Identify who is Using the Application.
Authorization - What permissions/access does the authenticated user have
*/

// disconnect prisma client when we want to quit
export const okay = (f: any) => {
  f()
    .catch((e: any) => {
      throw e;
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
};

// generic error function (decorator) for error responses
export const err = (message: string, extraOptions?: any) => {
  return JSON.stringify({
    error: true,
    status: "error",
    message: message,
    ...extraOptions,
  });
};

// generic (decorator) function for successful responses - (not in use yet)
export const succ = (message: string, extraOptions?: any) => {
  return JSON.stringify({
    error: false,
    status: "success",
    message: message,
    data: extraOptions,
  });
};

// checks if token is valid and if it is, then finds the user corresponding to it
// and attaches the corresponding user details as `req.me`.
export const authenticateToken = (
  req: Request,
  res: Response,
  next: () => void
) => {
  const header = req.headers["authorization"];
  console.log(header);
  const token = header?.split(" ")[1];
  if (!token || header?.split(" ")[0] !== "Bearer") {
    (req as any).user = undefined;
    next();
    return;
  }
  jwt.verify(token, JWT_SECRET, async (error, userId) => {
    if (error) {
      return res.send(err("invalid token")).end();
    }
    const user = await prisma.user.findUnique({
      where: {
        uuid: userId?.toString(),
      },
    });
    if (!user) (req as any).me = null;
    else (req as any).me = user;
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

export const isEmpty = (selector: string, fields: (string | undefined)[]) => {
  if (selector === "any") {
    return fields?.some((f) => {
      return !f || validator.isEmpty(f);
    });
  }
  if (selector === "all") {
    return fields?.every((f) => {
      return !f || validator.isEmpty(f);
    });
  }
  return true;
};

export const isEmail = (a: string | undefined) => {
  return a && validator.isEmail(a);
};

// filter object according to set of valid keys
export const getValidFields = (validKeys: string[], fromObject: any) => {
  if (validKeys?.length === 0) return {};
  if (!fromObject) return {};
  const keys = Object.keys(fromObject);
  if (keys?.length === 0) return {};
  let res: any = {};

  keys.forEach((key) => {
    if (validKeys.some((kk) => kk === key)) {
      res[key] = fromObject[key];
    }
  });
  return res;
};

// introduce artificial delay while serving requests to simulate real-world situations
export const delayResponse = (
  req: Request,
  res: Response,
  next: () => void
) => {
  setTimeout(next, ARTIFICIAL_DELAY_IN_MILLIS);
};
