import express from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { getUserNotificationsController, markAsReadController, getUnreadCountController, getUnreadListController } from "./notification.controller.js";

const router = express.Router();

// Lấy danh sách thông báo của user hiện tại, hỗ trợ lọc unread
router.get("/", authMiddleware, getUserNotificationsController);

// Đánh dấu đã đọc
router.put("/:id/read", authMiddleware, markAsReadController);

// Đếm số thông báo chưa đọc
router.get("/unread-count", authMiddleware, getUnreadCountController);

// Lấy 5 thông báo chưa đọc mới nhất
router.get("/unread-list", authMiddleware, getUnreadListController);

export default router;
