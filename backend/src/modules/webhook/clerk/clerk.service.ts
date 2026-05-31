import { prisma } from "../../../config/db";
import { UserJSON, WebhookEvent } from "@clerk/express";
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

    console.log("User created in database:", newUser);
  }

  static async handleDeleteUser(event: WebhookEvent) {
    const user = await prisma.user.findUnique({
      where: { id: event.data.id },
      select: { email: true },
    });
    if (!user) return;
    const deletedUser = await prisma.user.update({
      where: { id: event.data.id },
      data: {
        deleted_at: new Date(),
        email: `deleted_${event.data.id}_${user.email}`,
      },
    });

    console.log("User deleted from database:", deletedUser);
  }
}
