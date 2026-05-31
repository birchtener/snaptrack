import express from "express";
import cors from "cors";
import helmet from "helmet";
import { errorHandler } from "./middlewares/error.middleware";
import { clerkMiddleware } from "@clerk/express";
import InitializeRoutes from "./routes";

const app = express();

const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:5173",
  "https://snaptrack.birchtener.dev",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "x-workspace-id"],
  }),
);
app.use(helmet());
app.use(express.json());
app.use(clerkMiddleware());

InitializeRoutes(app);

app.use(errorHandler);

export default app;
