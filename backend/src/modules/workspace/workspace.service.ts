import { Prisma, SystemAction, Role } from "../../generated/prisma/client";
import { prisma } from "../../config/db";
import { AppError } from "../../utils/app.error";
import { SystemLogService } from "../system-log/system-log.service";

export class WorkspaceService {
  static async createWorkspace(
    name: string,
    userId: string,
    fieldDefinitions?: Prisma.JsonValue,
  ) {
    try {
      const workspace = await prisma.workspace.create({
        data: {
          name,
          created_by: userId,
          field_definitions: fieldDefinitions,
        },
        include: {
          creator: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
            },
          },
        },
      });

      void SystemLogService.createLog(
        workspace.id,
        userId,
        SystemAction.create_workspace,
        {
          workspace_id: workspace.id,
          workspace_name: workspace.name,
          workspace_creator: `${workspace.creator.first_name} ${workspace.creator.last_name}`,
        },
      );

      return workspace;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          throw new AppError("Workspace with this name already exists.", 400);
        }
      }

      if (error instanceof AppError) {
        throw error;
      }

      if (process.env.NODE_ENV === "development")
        console.error("Unexpected error creating workspace:", error);

      throw new AppError("Failed to create workspace.", 500);
    }
  }

  static async getWorkspaces(userId: string) {
    try {
      const workspaces = await prisma.workspace.findMany({
        where: {
          memberships: {
            some: {
              user_id: userId,
            },
          },
        },
        include: {
          creator: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
            },
          },
          memberships: {
            where: {
              user_id: userId,
            },
            select: {
              role: true,
            },
          },
        },
      });

      if (workspaces.length === 0) {
        throw new AppError("No workspaces found for this user.", 404);
      }

      return workspaces;
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (process.env.NODE_ENV === "development")
        console.error("Unexpected error retrieving workspaces:", error);
      throw new AppError("Failed to retrieve workspaces.", 500);
    }
  }

  static async getWorkspaceById(workspaceId: string, userId: string) {
    try {
      const workspace = await prisma.workspace.findFirst({
        where: {
          id: workspaceId,
          memberships: {
            some: {
              user_id: userId,
            },
          },
        },
      });

      if (!workspace) {
        throw new AppError("Workspace not found or access denied.", 404);
      }

      return workspace;
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (process.env.NODE_ENV === "development")
        console.error("Unexpected error retrieving workspace:", error);
      throw new AppError("Failed to retrieve workspace.", 500);
    }
  }

  static async updateWorkspace(
    workspaceId: string,
    userId: string,
    name: string,
    fieldDefinitions?: Prisma.JsonValue,
  ) {
    try {
      const workspace = await prisma.workspace.findFirst({
        where: {
          id: workspaceId,
          memberships: {
            some: {
              user_id: userId,
              role: {
                in: [Role.owner, Role.admin],
              },
            },
          },
        },
      });

      if (!workspace) {
        throw new AppError("Workspace not found or access denied.", 404);
      }

      const updatedWorkspace = await prisma.workspace.update({
        where: {
          id: workspaceId,
        },
        data: {
          name,
          field_definitions: fieldDefinitions,
        },
      });

      return updatedWorkspace;
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (process.env.NODE_ENV === "development")
        console.error("Unexpected error updating workspace:", error);
      throw new AppError("Failed to update workspace.", 500);
    }
  }

  static async deleteWorkspace(workspaceId: string, userId: string) {
    try {
      const workspace = await prisma.workspace.findFirst({
        where: {
          id: workspaceId,
          memberships: {
            some: {
              user_id: userId,
              role: Role.owner,
            },
          },
        },
      });

      if (!workspace) {
        throw new AppError("Workspace not found or access denied.", 404);
      }

      const deletedWorkspace = await prisma.workspace.delete({
        where: {
          id: workspaceId,
        },
      });

      return deletedWorkspace;
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (process.env.NODE_ENV === "development")
        console.error("Unexpected error deleting workspace:", error);
      throw new AppError("Failed to delete workspace.", 500);
    }
  }
}
