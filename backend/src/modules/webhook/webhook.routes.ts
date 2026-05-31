import { Router } from "express";
import { ClerkController } from "./clerk/clerk.controller";
import { verifyClerkWebhook } from "../../middlewares/webhook.middleware";
const router = Router();

router.post("/webhook", verifyClerkWebhook, ClerkController.handleWebhook);
export default router;
