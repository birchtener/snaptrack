import { prisma } from "../../config/db";
import { Prisma } from "../../generated/prisma/client";
import { AppError } from "../../utils/app.error";
import {
  updateUserAvatar,
  updateUser as clerkUpdateUser,
  deleteUser as clerkDeleteUser,
} from "../../api/clerk";
export class UserService {
  static async getUser(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new AppError("User not found", 404);
      }

      return user;
    } catch (error) {
      if (error instanceof AppError) throw error;

      if (process.env.NODE_ENV === "development")
        console.error("Database user fetch error:", error);
      throw new AppError(
        "An unexpected error occurred while fetching the user.",
        500,
      );
    }
  }

  static async deleteUser(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user || user.deleted_at) {
        throw new AppError("User not found", 404);
      }

      const ownedWorkspaces = await prisma.workspace.findMany({
        where: { created_by: userId },
        select: { id: true },
      });

      await prisma.$transaction(async (tx) => {
        if (ownedWorkspaces.length > 0) {
          const workspaceIds = ownedWorkspaces.map((w) => w.id);
          await tx.workspace.deleteMany({
            where: { id: { in: workspaceIds } },
          });
        }

        await tx.membership.deleteMany({
          where: { user_id: userId },
        });

        await tx.user.update({
          where: { id: userId },
          data: {
            first_name: "Archived",
            last_name: "User",
            email: `archived-${userId}@system.local`,
            image_url: null,
            deleted_at: new Date(),
          },
        });
      });

      await clerkDeleteUser(userId);

      return { id: userId, softDeleted: true };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw new AppError("User not found", 404);
        }
      }

      if (error instanceof AppError) throw error;

      console.error("Database user deletion error:", error);
      throw new AppError(
        "An unexpected error occurred during user deletion.",
        500,
      );
    }
  }

  static async updateUser(
    userId: string,
    data: { firstName?: string; lastName?: string; password?: string },
    fileBuffer?: Buffer,
    mimeType?: string,
    fileName?: string,
  ) {
    try {
      let avatarUrl: string | null = null;
      if (fileBuffer && mimeType && fileName) {
        avatarUrl = await updateUserAvatar(
          userId,
          fileBuffer,
          mimeType,
          fileName,
        );
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          first_name: data.firstName,
          last_name: data.lastName,
          ...(avatarUrl && { avatar_url: avatarUrl }),
        },
      });

      await clerkUpdateUser({
        userId,
        firstName: data.firstName,
        lastName: data.lastName,
        password: data.password,
      });

      return updatedUser;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw new AppError("User not found", 404);
        }
      }

      if (error instanceof AppError) throw error;

      console.error("Database user update error:", error);
      throw new AppError(
        "An unexpected error occurred during user update.",
        500,
      );
    }
  }
}
