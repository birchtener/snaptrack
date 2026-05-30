import { prisma } from "../../config/db";

export class UserService {
  static async syncUser(
    id: string,
    email: string,
    firstName: string,
    lastName: string,
    imageUrl?: string,
  ) {
    await prisma.user.upsert({
      where: { id },
      update: {
        email,
        first_name: firstName,
        last_name: lastName,
        image_url: imageUrl,
      },
      create: {
        id,
        email,
        first_name: firstName,
        last_name: lastName,
        image_url: imageUrl,
      },
    });
  }
}
