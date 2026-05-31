import { verifyWebhook } from "@clerk/express/webhooks";
import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/app.error";
export async function verifyClerkWebhook(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    console.log("Verifying Clerk webhook...");
    const evt = await verifyWebhook(req);
    req.body = evt;
    console.log("Clerk webhook verified successfully");
    next();
  } catch (err) {
    next(new AppError("Error verifying webhook", 400));
  }
}
