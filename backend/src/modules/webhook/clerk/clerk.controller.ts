import { ClerkService } from "./clerk.service";

export class ClerkController {
  static async handleWebhook(req: any, res: any) {
    if (req.body.type === "user.created") {
      await ClerkService.handleCreateUser(req.body);
      res.status(200).send("User created");
    } else if (req.body.type === "user.deleted") {
      await ClerkService.handleDeleteUser(req.body);
      res.status(200).send("User deleted");
    }
  }
}
