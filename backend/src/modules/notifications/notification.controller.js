import * as notificationService from "./notification.service.js";

// Lấy danh sách thông báo của user hiện tại
export async function getUserNotificationsController(req, res) {
    try {
        const notifications = await notificationService.getUserNotifications(req.user.id);
        res.json({ notifications });
    } catch (err) {
        res.status(500).json({ message: "GET_NOTIFICATIONS_FAILED" });
    }
}

// Đánh dấu đã đọc
export async function markAsReadController(req, res) {
    try {
        await notificationService.markAsRead(req.user.id, req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: "MARK_AS_READ_FAILED" });
    }
}
