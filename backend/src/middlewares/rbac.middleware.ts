import { Request, Response, NextFunction } from "express";
import { Role } from "../generated/prisma/client";
import { prisma } from "../config/db";

export const checkRole = (allowedRoles: Role[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;

    const workspace_id = (req.params.workspace_id ||
      req.headers["x-workspace-id"]) as string;

    if (!workspace_id) {
      return res
        .status(400)
        .json({ error: "Missing target workspace identifier context" });
    }

    try {
      const membership = await prisma.membership.findUnique({
        where: {
          user_id_workspace_id: {
            user_id: userId as string,
            workspace_id: workspace_id,
          },
        },
      });

      if (!membership) {
        return res
          .status(403)
          .json({ error: "Forbidden: You do not belong to this organization" });
      }

      const hasPermission = allowedRoles.includes(membership.role);
      if (!hasPermission) {
        return res.status(403).json({
          error: `Forbidden: This action requires one of the following permissions: [${allowedRoles.join(", ")}]`,
        });
      }

      req.workspace = {
        id: membership.workspace_id,
        role: membership.role,
      };

      return next();
    } catch (error) {
      console.error("RBAC Engine Validation Failure:", error);
      return res
        .status(500)
        .json({ error: "Internal access control parsing error" });
    }
  };
};
