export class Errors extends Error {
  statusCode: number;
  code?: string;

  constructor(statusCode: number, message: string, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;

    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, code = "BAD_REQUEST") {
    return new Errors(400, message, code);
  }

  static unauthorized(message = "Unauthorized", code = "UNAUTHORIZED") {
    return new Errors(401, message, code);
  }

  static notFound(message: string, code = "NOT_FOUND") {
    return new Errors(404, message, code);
  }

  static conflict(message: string, code = "CONFLICTS") {
    return new Errors(409, message, code);
  }

  static internal(
    message = "Internal Server Error",
    code = "INTERNAL_SERVER_ERROR",
  ) {
    return new Errors(500, message, code);
  }

  static disconect(message = "disconected", code = "DISCONECTED") {
    return new Errors(503, message, code);
  }
}
