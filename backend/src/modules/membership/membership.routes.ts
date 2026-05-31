import { Router } from "express";
import { MembershipController } from "./membership.controller";
import { checkRole } from "../../middlewares/rbac.middleware";
const router = Router();

router.use(checkRole(["owner", "admin", "scanner"]));

router.post(
  "/add/:workspace_id",
  checkRole(["owner", "admin"]),
  MembershipController.addMember,
);
router.get("/list/:workspace_id", MembershipController.getWorkspaceMembers);
router.patch(
  "/update/:workspace_id/:target_id",
  checkRole(["owner", "admin"]),
  MembershipController.updateMemberRole,
);
router.delete(
  "/remove/:workspace_id/:target_id",
  checkRole(["owner", "admin"]),
  MembershipController.removeMember,
);

export default router;
