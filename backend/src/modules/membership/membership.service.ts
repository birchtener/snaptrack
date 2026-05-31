import { prisma } from "../../config/db";
import { Role, Prisma, SystemAction } from "../../generated/prisma/client";
import { AppError } from "../../utils/app.error";
import { SystemLogService } from "../system-log/system-log.service";

export class MembershipService {
  static async addMember(
    workspaceId: string,
    userId: string,
    targetId: string,
    role: Role,
  ) {
    try {
      const newMember = await prisma.membership.create({
        data: {
          workspace_id: workspaceId,
          user_id: targetId,
          role,
        },
        include: {
          user: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
            },
          },
        },
      });

      void SystemLogService.createLog(
        workspaceId,
        userId as string,
        SystemAction.add_member,
        {
          target_user_id: newMember.user_id,
          target_user_name: `${newMember.user.first_name} ${newMember.user.last_name}`,
          new_role: role,
        },
      );

      return newMember;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          throw new AppError("User is already a member of this workspace", 400);
        } else if (error.code === "P2003") {
          throw new AppError("Workspace or User not found", 404);
        }
      }

      if (error instanceof AppError) throw error;

      if (process.env.NODE_ENV === "development")
        console.error("Unexpected error adding member:", error);

      throw new AppError("Failed to add member", 500);
    }
  }

  static async getWorkspaceMembers(workspaceId: string) {
    const members = await prisma.membership.findMany({
      where: { workspace_id: workspaceId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true,
            image_url: true,
          },
        },
      },
    });

    return members;
  }

  static async updateMemberRole(
    workspaceId: string,
    userId: string,
    targetId: string,
    newRole: Role,
  ) {
    try {
      const updatedMember = await prisma.membership.update({
        where: {
          user_id_workspace_id: {
            user_id: targetId,
            workspace_id: workspaceId,
          },
        },
        data: {
          role: newRole,
        },
        include: {
          user: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
            },
          },
        },
      });

      void SystemLogService.createLog(
        workspaceId,
        userId as string,
        SystemAction.update_member,
        {
          target_user_id: updatedMember.user_id,
          target_user_name: `${updatedMember.user.first_name} ${updatedMember.user.last_name}`,
          new_role: updatedMember.role,
        },
      );

      return updatedMember;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw new AppError("Membership not found", 404);
        }
      }

      if (error instanceof AppError) throw error;

      if (process.env.NODE_ENV === "development")
        console.error("Unexpected error updating member role:", error);

      throw new AppError("Failed to update member role", 500);
    }
  }

  static async removeMember(
    workspaceId: string,
    userId: string,
    targetId: string,
  ) {
    try {
      if (targetId === userId) {
        throw new AppError(
          "Users cannot remove themselves from the workspace",
          400,
        );
      }

      const membership = await prisma.membership.findUnique({
        where: {
          user_id_workspace_id: {
            user_id: targetId,
            workspace_id: workspaceId,
          },
        },
      });

      if (!membership) {
        throw new AppError("Membership not found", 404);
      }

      if (membership.role === "owner") {
        throw new AppError("Cannot remove the owner of the workspace", 400);
      }

      const deletedMember = await prisma.membership.delete({
        where: {
          user_id_workspace_id: {
            user_id: targetId,
            workspace_id: workspaceId,
          },
        },
        include: {
          user: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
            },
          },
        },
      });

      void SystemLogService.createLog(
        workspaceId,
        userId as string,
        SystemAction.remove_member,
        {
          target_user_id: deletedMember.user_id,
          target_user_name: `${deletedMember.user.first_name} ${deletedMember.user.last_name}`,
        },
      );

      return deletedMember;
    } catch (error) {
      if (error instanceof AppError) throw error;

      if (process.env.NODE_ENV === "development")
        console.error("Unexpected error removing member:", error);
      throw new AppError("Failed to remove member", 500);
    }
  }
}
