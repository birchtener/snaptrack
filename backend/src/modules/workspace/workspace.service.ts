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
          student_metadata_schema: fieldDefinitions ?? [],
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

      await prisma.membership.create({
        data: {
          user_id: userId,
          role: Role.owner,
          workspace_id: workspace.id,
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

      return {
        id: workspace.id,
        name: workspace.name,
        createdBy: workspace.created_by,
        createdAt: workspace.created_at,
        updatedAt: workspace.updated_at,
        userRole: Role.owner,
        studentMetadataSchema: workspace.student_metadata_schema,
        creator: workspace.creator
          ? {
              id: workspace.creator.id,
              firstName: workspace.creator.first_name,
              lastName: workspace.creator.last_name,
            }
          : null,
      };
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
              email: true,
            },
          },
          memberships: {
            select: {
              user: {
                select: {
                  id: true,
                  first_name: true,
                  last_name: true,
                  email: true,
                },
              },
              role: true,
            },
          },
        },
      });

      console.log(
        `Retrieved ${workspaces.length} workspaces for user ${userId}.`,
        {
          userId,
          workspaceCount: workspaces.length,
        },
      );

      if (workspaces.length === 0) {
        throw new AppError("No workspaces found for this user.", 404);
      }

      const camelCaseWorkspaces = workspaces.map((workspace) => {
        const userRole =
          workspace.memberships.find((m) => m.user.id === userId)?.role || null;
        return {
          id: workspace.id,
          name: workspace.name,
          createdAt: workspace.created_at,
          updatedAt: workspace.updated_at,
          userRole: userRole,
          creator: workspace.creator
            ? {
                id: workspace.creator.id,
                firstName: workspace.creator.first_name,
                lastName: workspace.creator.last_name,
                email: workspace.creator.email,
              }
            : null,
          members: workspace.memberships.map((m) => ({
            id: m.user.id,
            firstName: m.user.first_name,
            lastName: m.user.last_name,
            email: m.user.email,
            role: m.role,
          })),
        };
      });

      console.log(
        `Retrieved ${camelCaseWorkspaces.length} workspaces for user ${userId}.`,
      );

      return camelCaseWorkspaces;
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
        include: {
          creator: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
            },
          },
          memberships: {
            select: {
              user: {
                select: {
                  id: true,
                  first_name: true,
                  last_name: true,
                  email: true,
                },
              },
              role: true,
            },
          },
        },
      });

      if (!workspace) {
        throw new AppError("Workspace not found or access denied.", 404);
      }

      const userRole =
        workspace.memberships.find((m) => m.user.id === userId)?.role || null;

      return {
        id: workspace.id,
        name: workspace.name,
        userRole: userRole,
        createdBy: workspace.created_by,
        createdAt: workspace.created_at,
        updatedAt: workspace.updated_at,
        studentMetadataSchema: workspace.student_metadata_schema,
        creator: workspace.creator
          ? {
              id: workspace.creator.id,
              firstName: workspace.creator.first_name,
              lastName: workspace.creator.last_name,
              email: workspace.creator.email,
            }
          : null,
        members: workspace.memberships.map((m) => ({
          id: m.user.id,
          firstName: m.user.first_name,
          lastName: m.user.last_name,
          email: m.user.email,
          role: m.role,
        })),
      };
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
          student_metadata_schema: fieldDefinitions ?? [],
        },
        include: {
          creator: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
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

      const userRole = updatedWorkspace.memberships[0]?.role || null;

      return {
        id: updatedWorkspace.id,
        name: updatedWorkspace.name,
        userRole: userRole,
        createdBy: updatedWorkspace.created_by,
        createdAt: updatedWorkspace.created_at,
        updatedAt: updatedWorkspace.updated_at,
        studentMetadataSchema: updatedWorkspace.student_metadata_schema,
        creator: updatedWorkspace.creator
          ? {
              id: updatedWorkspace.creator.id,
              firstName: updatedWorkspace.creator.first_name,
              lastName: updatedWorkspace.creator.last_name,
              email: updatedWorkspace.creator.email,
            }
          : null,
      };
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
        include: {
          creator: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
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

      const userRole = deletedWorkspace.memberships[0]?.role || null;

      return {
        id: deletedWorkspace.id,
        name: deletedWorkspace.name,
        userRole: userRole,
        createdBy: deletedWorkspace.created_by,
        createdAt: deletedWorkspace.created_at,
        updatedAt: deletedWorkspace.updated_at,
        studentMetadataSchema: deletedWorkspace.student_metadata_schema,
        creator: deletedWorkspace.creator
          ? {
              id: deletedWorkspace.creator.id,
              firstName: deletedWorkspace.creator.first_name,
              lastName: deletedWorkspace.creator.last_name,
              email: deletedWorkspace.creator.email,
            }
          : null,
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (process.env.NODE_ENV === "development")
        console.error("Unexpected error deleting workspace:", error);
      throw new AppError("Failed to delete workspace.", 500);
    }
  }
}
