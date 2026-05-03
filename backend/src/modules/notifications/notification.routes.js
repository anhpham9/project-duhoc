import express from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { getUserNotificationsController, markAsReadController } from "./notification.controller.js";

const router = express.Router();

// Lấy danh sách thông báo của user hiện tại, hỗ trợ lọc unread
router.get("/", authMiddleware, getUserNotificationsController);

// Đánh dấu đã đọc
router.put("/:id/read", authMiddleware, markAsReadController);

export default router;
