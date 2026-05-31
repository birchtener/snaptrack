import { verifyWebhook } from "@clerk/express/webhooks";
import { NextFunction, Request, Response } from "express";

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
    console.error("Error verifying webhook:", err);
    res.status(400).send("Error verifying webhook");
  }
}
