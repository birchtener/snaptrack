import { Router } from "express";
import { UserController } from "./user.controller";
const router = Router();

router.get("/get", UserController.getUser);
router.delete("/delete", UserController.deleteUser);
router.patch("/update", UserController.updateUser);

export default router;
