import { Express, raw } from "express";
import UserRoute from "./modules/user/user.routes";
import WebhookRoute from "./modules/webhook/webhook.routes";
import MembershipRoute from "./modules/membership/membership.routes";
import EventRoute from "./modules/event/event.router";
import WorkspaceRoute from "./modules/workspace/workspace.routes";
import StudentRoute from "./modules/student/student.routes";
import { protect } from "./middlewares/auth.middleware";

export default function InitializeRoutes(app: Express) {
  // Health check endpoint
  app.get("/health", (req, res) => {
    res.status(200).json({ status: "healthy", timestamp: new Date() });
  });
  app.use("/api/v1", WebhookRoute);

  app.use(protect);

  app.use("/api/v1/users", UserRoute);
  app.use("/api/v1/workspaces", WorkspaceRoute);
  app.use("/api/v1/:workspace_id/memberships", MembershipRoute);
  app.use("/api/v1/:workspace_id/events", EventRoute);
  app.use("/api/v1/:workspace_id/students", StudentRoute);
}
