import { Request, Response } from "express";
import { getAuth } from "@clerk/express";
import { UserService } from "./user.service";

export class UserController {
  static async syncUser(req: Request, res: Response) {
    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { email, firstName, lastName, imageUrl } = req.body;

    if (!email || !firstName || !lastName) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      const user = await UserService.syncUser(
        userId,
        email,
        firstName,
        lastName,
        imageUrl,
      );
      res.status(200).json(user);
    } catch (error) {
      console.error("Error syncing user:", error);
      res.status(500).json({ error: "Failed to sync user" });
    }
  }
}
