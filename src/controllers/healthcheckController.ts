import { Request, Response } from "express";
import { checkDatabaseConnection } from "../services/healthcheckService";
import { asyncHandler } from "../middlewares/asyncHandler";
import { Errors } from "../utils/errors";

export const livenessCheck = (req: Request, res: Response) => {
  return res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
};

export const readinessCheck = asyncHandler(
  async (_req: Request, res: Response) => {
    try {
      await checkDatabaseConnection();

      return res.status(200).json({
        status: "ok",
        database: "connected",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      throw Errors.disconect("Database not available", "DISCONECTED");
    }
  },
);
