import { Request, Response, NextFunction } from "express";
import { logger, sanitizeBody } from "../utils/logger";
import { v4 as uuidv4 } from "uuid";

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const start = process.hrtime.bigint(); // 🔥 más preciso que Date.now()

  const requestId = uuidv4();

  const childLogger = logger.child({
    requestId,
    ip: req.ip,
    userAgent: req.headers["user-agent"],
  });

  (req as any).logger = childLogger;
  (req as any).requestId = requestId;

  res.on("finish", () => {
    const end = process.hrtime.bigint();
    const durationMs = Number(end - start) / 1_000_000;

    let safeBody = undefined;

    if (process.env.NODE_ENV === "development") {
      safeBody = sanitizeBody(req.body);
    }

    childLogger.info(
      {
        method: req.method,
        path: req.originalUrl,
        statusCode: res.statusCode,
        duration: `${durationMs.toFixed(2)}ms`,
        userId: (req as any).user?.userId,
        body: safeBody,
      },
      "HTTP Request",
    );
  });

  next();
};
