import { Express } from "express";
import UserRoute from "./modules/user/user.routes";
export default function InitializeRoutes(app: Express) {
  // Health check endpoint
  app.get("/health", (req, res) => {
    res.status(200).json({ status: "healthy", timestamp: new Date() });
  });

  app.use("/api/v1/user", UserRoute);
}
