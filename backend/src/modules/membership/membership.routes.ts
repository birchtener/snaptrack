import { Router } from "express";
import { MembershipController } from "./membership.controller";
import { checkRole } from "../../middlewares/rbac.middleware";
import { Role } from "../../generated/prisma/client";
const router = Router({
  mergeParams: true,
});

router.post(
  "/",
  checkRole([Role.owner, Role.admin]),
  MembershipController.addMember,
);
router.get(
  "/",
  checkRole([Role.owner, Role.admin, Role.scanner]),
  MembershipController.getWorkspaceMembers,
);
router.patch(
  "/:target_id",
  checkRole([Role.owner, Role.admin]),
  MembershipController.updateMemberRole,
);
router.delete(
  "/:target_id",
  checkRole([Role.owner, Role.admin]),
  MembershipController.removeMember,
);

export default router;
