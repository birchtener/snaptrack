import { Router } from "express";
import { UserController } from "./user.controller";
const router = Router();

router.get("/", UserController.getUser);
router.delete("/", UserController.deleteUser);
router.patch("/", UserController.updateUser);

export default router;
