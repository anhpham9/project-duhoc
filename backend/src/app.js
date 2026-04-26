import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import morgan from "morgan";

import "./db/associations.js";

import authRoutes from "./modules/auth/auth.routes.js";
import activityLogRoutes from "./modules/admin/activityLog.routes.js";

const app = express();

// Origin động: lấy từ biến môi trường FRONTEND_ORIGIN, fallback localhost:3000
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:3000";
app.use(cors({
  origin: FRONTEND_ORIGIN,
  credentials: true
}));
app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

app.use("/api/auth", authRoutes);
app.use("/api/activity-logs", activityLogRoutes);

export default app;