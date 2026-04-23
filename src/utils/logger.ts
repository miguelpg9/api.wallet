import pino from "pino";

const isProd = process.env.NODE_ENV === "production";

export const logger = pino(
  isProd
    ? {
        level: "info",
      }
    : {
        level: "debug",
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:standard",
            ignore: "pid,hostname",
          },
        },
      },
);

const SENSITIVE_FIELDS = ["password", "token", "refreshToken"];

export const sanitizeBody = (body: any) => {
  if (!body || typeof body !== "object") return body;

  const clone = { ...body };

  for (const key of SENSITIVE_FIELDS) {
    if (clone[key]) {
      clone[key] = "***";
    }
  }

  return clone;
};
