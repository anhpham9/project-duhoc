import Notification from "./notification.model.js";
import { createNotification } from "./notification.repository.js";
import * as userRepo from "../users/user.repository.js";

/**
 * Gửi notification tới user hoặc role
 * @param {Object} params
 * @param {number} [params.user_id] - ID user nhận
 * @param {number} [params.role_id] - ID role nhận
 * @param {string} [params.type] - Loại thông báo
 * @param {string} [params.action] - thao tác (created, updated, deleted,...)
 * @param {string} [params.title] - Tiêu đề
 * @param {string} [params.message] - Nội dung
 * @param {string} [params.entity_type] - Loại đối tượng tác động (user, post, ...)
 * @param {number} [params.entity_id] - ID của record
 * @param {Object} [params.data] - Dữ liệu bổ sung
 */
export async function sendNotification({ user_id = null, role_id = null, type, action = null, title, message = null, entity_type = null, entity_id = null, data = null }) {
    if (!user_id && !role_id) throw new Error("Phải có user_id hoặc role_id");
    await createNotification({ user_id, role_id, type, action, title, message, entity_type, entity_id, data });
}

// Gửi notification cho tất cả user thuộc các role chỉ định
export async function sendNotificationToRoles({ roles, ...notification }) {
    if (!roles || !Array.isArray(roles) || roles.length === 0) throw new Error("ROLES_REQUIRED");
    // Lấy danh sách user thuộc các role
    const users = await userRepo.getUsersByRoles(roles); // bạn cần có hàm này trong user.repository.js
    const userIds = users.map(u => u.id);
    // Gửi notification cho từng user
    for (const user_id of userIds) {
        await sendNotification({ ...notification, user_id });
    }
}

// Lấy danh sách thông báo của user hiện tại (mới nhất trước)
export async function getUserNotifications(user_id, { limit = 50, offset = 0, unread } = {}) {
    const where = { user_id };
    if (unread === 'true') where.is_read = false;
    return Notification.findAll({
        where,
        order: [["created_at", "DESC"]],
        limit,
        offset
    });
}

// Lấy danh sách thông báo của user hiện tại (có phân trang và tổng số lượng)
export async function getUserNotificationsWithCount(user_id, { limit = 10, offset = 0, unread } = {}) {
    const where = { user_id };
    if (unread === 'true') where.is_read = false;
    const { rows: notifications, count: total } = await Notification.findAndCountAll({
        where,
        order: [["created_at", "DESC"]],
        limit,
        offset
    });
    return { notifications, total };
}

// Đánh dấu đã đọc thông báo
export async function markAsRead(user_id, notification_id) {
    const noti = await Notification.findOne({ where: { id: notification_id, user_id } });
    if (!noti) throw new Error("NOTIFICATION_NOT_FOUND");
    noti.is_read = true;
    await noti.save();
}

// Lấy số lượng thông báo chưa đọc của user
export async function getUnreadCount(user_id) {
    return Notification.count({ where: { user_id, is_read: false } });
}

// Lấy danh sách N thông báo chưa đọc mới nhất cho user
export async function getUnreadList(user_id, limit = 5) {
    return Notification.findAll({
        where: { user_id, is_read: false },
        order: [["created_at", "DESC"]],
        limit
    })
}
