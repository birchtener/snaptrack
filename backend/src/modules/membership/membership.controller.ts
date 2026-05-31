import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { MembershipService } from "./membership.service";
export class MembershipController {
  static addMember = catchAsync(async (req: Request, res: Response) => {
    const workspaceId = req.workspace?.id;
    const userId = req.user?.id;
    const { role, targetId } = req.body;

    if (!workspaceId || !userId || !role || !targetId) {
      return res.status(400).json({ error: "Invalid request data" });
    }

    const newMember = MembershipService.addMember(
      workspaceId,
      userId,
      targetId,
      role,
    );

    return res.status(201).json({ success: true, data: newMember });
  });

  static getWorkspaceMembers = catchAsync(
    async (req: Request, res: Response) => {
      const workspaceId = req.workspace?.id;

      if (!workspaceId) {
        return res.status(400).json({ error: "Invalid request data" });
      }

      const members = await MembershipService.getWorkspaceMembers(workspaceId);

      return res.status(200).json({ success: true, data: members });
    },
  );

  static updateMemberRole = catchAsync(async (req: Request, res: Response) => {
    const workspaceId = req.workspace?.id;
    const userId = req.user?.id;
    const targetId = req.params.target_id as string;
    const { newRole } = req.body;

    if (!workspaceId || !userId || !newRole || !targetId) {
      return res.status(400).json({ error: "Invalid request data" });
    }

    const updatedMember = await MembershipService.updateMemberRole(
      workspaceId,
      userId,
      targetId,
      newRole,
    );

    return res.status(200).json({ success: true, data: updatedMember });
  });

  static removeMember = catchAsync(async (req: Request, res: Response) => {
    const workspaceId = req.workspace?.id;
    const userId = req.user?.id;
    const targetId = req.params.target_id as string;

    if (!workspaceId || !userId || !targetId) {
      return res.status(400).json({ error: "Invalid request data" });
    }

    const deletedMember = await MembershipService.removeMember(
      workspaceId,
      userId,
      targetId,
    );

    return res.status(200).json({ success: true, data: deletedMember });
  });
}
