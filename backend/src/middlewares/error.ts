import { Request, Response, NextFunction } from "express";

// Custom ErrorHandler class with statusCode
class ErrorHandler extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;

    // Maintains proper stack trace for where error was thrown
    Error.captureStackTrace(this, this.constructor);
  }
}

// Middleware for handling errors
export const errorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): Response => {
  err.message = err.message || "Internal Server Error";
  err.statusCode = err.statusCode || 500;

  // Duplicate key error (MongoDB, Prisma might have different)
  if (err.code === 11000) {
    const message = `Duplicate ${Object.keys(err.keyValue)} Entered`;
    err = new ErrorHandler(message, 400);
  }

  // JWT Errors
  if (err.name === "JsonWebTokenError") {
    const message = "Json Web Token is Invalid. Try Again!";
    err = new ErrorHandler(message, 400);
  }

  if (err.name === "TokenExpiredError") {
    const message = "Json Web Token is Expired. Try to Login!";
    err = new ErrorHandler(message, 400);
  }

  // CastError (common with Mongo, adjust if using Prisma/PostgreSQL)
  if (err.name === "CastError") {
    const message = `Invalid ${err.path}`;
    err = new ErrorHandler(message, 400);
  }

  // Extract validation error messages (useful if you use Zod/Yup/etc.)
  const errorMessage = err.errors
    ? Object.values(err.errors).map((e: any) => e.message).join(" ")
    : err.message;

  return res.status(err.statusCode).json({
    success: false,
    message: errorMessage,
  });
};

export default ErrorHandler;
