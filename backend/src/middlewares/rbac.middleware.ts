// src/middlewares/rbac.middleware.ts
import { Request, Response, NextFunction } from "express";
import { Role } from "../generated/prisma/client";
import { prisma } from "../config/db";
import { AppError } from "../utils/app.error";

export const checkRole = (allowedRoles: Role[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;

    const workspaceId = (req.params.workspace_id ||
      req.params.id ||
      req.headers["x-workspace-id"]) as string;

    if (!workspaceId) {
      return next(
        new AppError("Missing target workspace identifier context.", 400),
      );
    }

    try {
      const membership = await prisma.membership.findUnique({
        where: {
          user_id_workspace_id: {
            user_id: userId!,
            workspace_id: workspaceId,
          },
        },
      });

      if (!membership) {
        return next(
          new AppError(
            "Access Denied: You do not have an active membership association inside this workspace.",
            403,
          ),
        );
      }

      const hasPermission = allowedRoles.includes(membership.role);
      if (!hasPermission) {
        return next(
          new AppError(
            `Access Denied: Your current authorization tier (${membership.role}) does not possess the permissions required for this administrative operation.`,
            403,
          ),
        );
      }

      req.workspace = {
        id: membership.workspace_id,
        role: membership.role,
      };

      return next();
    } catch (error) {
      return next(error);
    }
  };
};
