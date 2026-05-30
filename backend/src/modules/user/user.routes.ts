import { Router } from "express";
import { UserController } from "./user.controller";
import { requireAuth } from "@clerk/express";
const router = Router();

router.post("/sync", requireAuth(), UserController.syncUser);

export default router;
