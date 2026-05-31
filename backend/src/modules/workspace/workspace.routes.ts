import { Router } from "express";
import { WorkspaceController } from "./workspace.controller";
import { validate } from "../../middlewares/validate.middleware";
import { checkRole } from "../../middlewares/rbac.middleware";
import { createWorkspaceSchema } from "./workspace.validation";
import { Role } from "../../generated/prisma/client";
const router = Router({
  mergeParams: true,
});

router.post(
  "/",
  validate(createWorkspaceSchema),
  WorkspaceController.createWorkspace,
);
router.get("/", WorkspaceController.getWorkspaces);
router.get(
  "/:workspace_id",
  checkRole([Role.owner, Role.admin, Role.scanner]),
  WorkspaceController.getWorkspaceById,
);
router.delete(
  "/:workspace_id",
  checkRole([Role.owner]),
  WorkspaceController.deleteWorkspace,
);

export default router;
