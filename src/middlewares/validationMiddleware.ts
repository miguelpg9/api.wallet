import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import { Errors } from "../utils/errors";

export const validateBody = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse(req.body);
      req.validatedBody = parsed;
      next();
    } catch (err: any) {
      throw Errors.badRequest("Validation error", "VALIDATION ERROR");
    }
  };
};

export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse(req.query);
      req.validatedQuery = parsed;
      next();
    } catch (err: any) {
      throw Errors.badRequest("Validation error", "VALIDATION_ERROR");
    }
  };
};
