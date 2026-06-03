import { prisma } from "../../../config/db";
import { UserJSON, WebhookEvent } from "@clerk/express";
import { AppError } from "../../../utils/app.error";
export class ClerkService {
  static async handleCreateUser(event: WebhookEvent) {
    const userData = event.data as UserJSON;
    const primaryEmail = userData.email_addresses[0]?.email_address;

    if (!primaryEmail) {
      throw new AppError(
        "Clerk user payload is missing a primary email address.",
        400,
      );
    }

    const newUser = await prisma.user.upsert({
      where: {
        id: userData.id,
      },
      create: {
        id: userData.id,
        email: primaryEmail,
        first_name: userData.first_name || "",
        last_name: userData.last_name || "",
        image_url: userData.image_url || "",
      },
      update: {
        email: primaryEmail,
        first_name: userData.first_name || "",
        last_name: userData.last_name || "",
        image_url: userData.image_url || "",
      },
    });

    const defaultWorkspace = await prisma.workspace.create({
      data: {
        name: `${newUser.first_name}'s Workspace`,
        created_by: newUser.id,
      },
    });

    const membership = await prisma.membership.create({
      data: {
        user_id: newUser.id,
        workspace_id: defaultWorkspace.id,
        role: "owner",
      },
    });

    if (process.env.NODE_ENV === "development") {
      console.log("User created in database:", {
        user: newUser,
        defaultWorkspace,
        membership,
      });
    }
  }

  static async handleDeleteUser(event: WebhookEvent) {
    const user = await prisma.user.findUnique({
      where: { id: event.data.id },
    });

    if (!user || user.deleted_at) {
      throw new AppError("User not found", 404);
    }

    const ownedWorkspaces = await prisma.workspace.findMany({
      where: { created_by: user.id },
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
        where: { user_id: user.id },
      });

      await tx.user.update({
        where: { id: user.id },
        data: {
          first_name: "Archived",
          last_name: "User",
          email: `archived-${user.id}@system.local`,
          image_url: null,
          deleted_at: new Date(),
        },
      });
    });

    console.log("User deleted from database:", user.id);
  }
}
