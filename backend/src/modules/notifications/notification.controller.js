import * as notificationService from "./notification.service.js";

// Lấy danh sách thông báo của user hiện tại
export async function getUserNotificationsController(req, res) {
    try {
        const { unread, limit = 10, page = 1 } = req.query;
        const pageInt = parseInt(page) || 1;
        const limitInt = parseInt(limit) || 10;
        const offset = (pageInt - 1) * limitInt;
        const { notifications, total } = await notificationService.getUserNotificationsWithCount(req.user.id, { unread, limit: limitInt, offset });
        res.json({ notifications, total, page: pageInt, totalPages: Math.ceil(total / limitInt) });
    } catch (err) {
        res.status(500).json({ message: "GET_NOTIFICATIONS_FAILED" });
    }
}

// Đánh dấu đã đọc
export async function markAsReadController(req, res) {
        console.log('markAsReadController  1')

    try {
        console.log('markAsReadController starting')
        await notificationService.markAsRead(req.user.id, req.params.id);
        res.json({ success: true });
    } catch (err) {
        console.error("Mark as read error", err);
        res.status(500).json({ message: "MARK_AS_READ_FAILED" });
    }
}

// Đếm số thông báo chưa đọc
export async function getUnreadCountController(req, res) {
    try {
        const count = await notificationService.getUnreadCount(req.user.id)
        res.json({ count })
    } catch (err) {
        res.status(500).json({ message: "GET_UNREAD_COUNT_FAILED" })
    }
}

// Lấy 5 thông báo chưa đọc mới nhất
export async function getUnreadListController(req, res) {
    try {
        const notifications = await notificationService.getUnreadList(req.user.id, 5)
        res.json({ notifications })
    } catch (err) {
        res.status(500).json({ message: "GET_UNREAD_LIST_FAILED" })
    }
}
