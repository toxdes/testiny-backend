import jwt from "jsonwebtoken";
import validator from "validator";

import { JWT_SECRET, ARTIFICIAL_DELAY_IN_MILLIS } from "../config/constants";
import { prisma } from ".";

import { Request, Response } from "express";
import { CUSTOM_RESPONSE_HEADERS } from "../config/constants";

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

// time in human readable format
// https://stackoverflow.com/a/33487313/6027457 -> x days ago
type EpochType = [string, number];

const epochs: EpochType[] = [
  ["year", 31536000],
  ["month", 2592000],
  ["day", 86400],
  ["hour", 3600],
  ["minute", 60],
  ["second", 1],
];

const getDuration = (
  timeAgoInSeconds: number
): { epoch: string; interval: number } | undefined => {
  for (let [name, seconds] of epochs) {
    const interval = Math.floor(timeAgoInSeconds / seconds);
    if (interval >= 1) {
      return {
        interval: interval,
        epoch: name,
      };
    }
  }
};

export const fromNow = (date: Date) => {
  const timeAgoInSeconds = Math.floor(
    (new Date().valueOf() - new Date(date).valueOf()) / 1000
  );
  let res = getDuration(timeAgoInSeconds);
  if (res) {
    const { interval, epoch } = res;
    const suffix = interval === 1 ? "" : "s";
    return `${interval} ${epoch}${suffix} ago`;
  } else {
    return "Just now";
  }
};

// check if given string is valid uuid
export const isUUID = (s: string): boolean => {
  let res = s?.match(
    "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$"
  )?.length;
  if (!res) return false;
  return res > 0;
};

export const customResponseHeaders = (
  req: Request,
  res: Response,
  next: () => void
) => {
  Object.keys(CUSTOM_RESPONSE_HEADERS).forEach((key: string) => {
    res.header(key, CUSTOM_RESPONSE_HEADERS[key]);
  });
  next();
};
