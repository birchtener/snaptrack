import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/app.error";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  let statusCode = 500;
  if (err instanceof AppError) statusCode = err.statusCode;
  if (err instanceof ZodError) statusCode = 400;

  let message = err.message || "Internal Server Error";
  let errors: any[] | undefined = undefined;

  if (err instanceof ZodError) {
    message =
      "Validation Failure: Request payload did not pass schema validation.";
    errors = err.issues.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
  }

  const isOperational =
    err instanceof AppError || err instanceof ZodError || err.isOperational;
  const finalMessage =
    process.env.NODE_ENV === "production" && !isOperational
      ? "An unexpected system error occurred."
      : message;

  if (!isOperational) {
    console.error("CRITICAL SYSTEM CRASH:", err);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      message: finalMessage,
      statusCode,
      ...(errors && { errors }),
    },
  });
};
