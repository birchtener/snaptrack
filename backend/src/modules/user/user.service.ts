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
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    return user;
  }

  static async deleteUser(userId: string) {
    try {
      const deletedUser = await prisma.user.delete({
        where: { id: userId },
      });

      await clerkDeleteUser(userId);

      return deletedUser;
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
