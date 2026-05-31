import { prisma } from "../../../config/db";
import { UserJSON, WebhookEvent } from "@clerk/express";
import { AppError } from "../../../utils/app.error";
export class ClerkService {
  static async handleCreateUser(event: WebhookEvent) {
    const newUser = await prisma.user.create({
      data: {
        id: (event.data as UserJSON).id,
        email: (event.data as UserJSON).email_addresses[0].email_address,
        first_name: (event.data as UserJSON).first_name as string,
        last_name: (event.data as UserJSON).last_name as string,
        image_url: (event.data as UserJSON).image_url as string,
      },
    });

    const defaultWorkspace = await prisma.workspace.create({
      data: {
        name: `${newUser.first_name}'s Workspace`,
        created_by: newUser.id,
      },
    });

    console.log("User created in database:", {
      user: newUser,
      defaultWorkspace,
    });
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
