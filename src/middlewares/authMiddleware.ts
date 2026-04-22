import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { Errors } from "../utils/errors";
import { asyncHandler } from "./asyncHandler";

type JwtPayload = {
  userId: string;
  email: string;
};

const JWT_SECRET = process.env.JWT_SECRET as string;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}

export const authenticateToken = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw Errors.unauthorized(
        "Authorization header missing or malformed",
        "UNAUTHORIZED",
      );
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
      throw Errors.unauthorized("Token not provided");
    }
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.user = decoded;
    next();
  },
);
