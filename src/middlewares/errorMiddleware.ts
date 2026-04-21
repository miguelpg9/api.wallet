import { NextFunction, Request, Response } from "express";
import { Errors } from "../utils/errors";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (err instanceof Errors) {
    return res.status(err.statusCode).json({
      message: err.message,
      code: err.code,
    });
  }

  if (err.name === "ZodError") {
    return res.status(400).json({
      message: "Validation error",
      code: "VALIDATION_ERROR",
      errors: err.errors,
    });
  }

  console.error("Unhandled error:", err);

  const isDev = process.env.NODE_ENV === "development";

  return res.status(500).json({
    message: isDev ? err.message : "Internal server error",
    code: "INTERNAL_SERVER_ERROR",
    ...(isDev && { stack: err.stack }),
  });
};
