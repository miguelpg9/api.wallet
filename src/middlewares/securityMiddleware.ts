import helmet, { HelmetOptions } from "helmet";
import type { RequestHandler } from "express";
import rateLimit from "express-rate-limit";

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 10, // 10 requests
  message: "Too many requests, please try again later",
});

const env = process.env.NODE_ENV || "development";

let securityMiddleware: RequestHandler;

const isProd = process.env.NODE_ENV === "production";

const commonHelmetOptions: HelmetOptions = {
  contentSecurityPolicy: isProd ? undefined : false,
  crossOriginEmbedderPolicy: false,
};

if (env === "test") {
  securityMiddleware = (req, res, next) => next();
} else {
  securityMiddleware = helmet(commonHelmetOptions);
}

export default securityMiddleware;
