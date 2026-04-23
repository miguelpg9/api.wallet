import { NextFunction, Request, Response } from "express";
import { Errors } from "../utils/errors";
import { logger, sanitizeBody } from "../utils/logger";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const isDev = process.env.NODE_ENV === "development";

  const log = (req as any).logger || logger;

  if (err instanceof Errors) {
    log.warn(
      {
        message: err.message,
        code: err.code,
        path: req.path,
        method: req.method,
        userId: (req as any).user?.userId,
      },
      "Handled error",
    );

    return res.status(err.statusCode).json({
      message: err.message,
      code: err.code,
    });
  }

  if (err.name === "ZodError") {
    log.warn(
      {
        errors: err.errors,
        path: req.path,
        method: req.method,
        userId: (req as any).user?.userId,
      },
      "Validation error",
    );

    return res.status(400).json({
      message: "Validation error",
      code: "VALIDATION_ERROR",
      errors: err.errors,
    });
  }

  log.error(
    {
      message: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
      userId: (req as any).user?.userId,
      body: sanitizeBody(req.body),
      query: req.query,
      params: req.params,
    },
    "Unhandled error",
  );

  return res.status(500).json({
    message: isDev ? err.message : "Internal server error",
    code: "INTERNAL_SERVER_ERROR",
    ...(isDev && { stack: err.stack }),
  });
};
