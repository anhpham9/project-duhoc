import Notification from "./notification.model.js";
import { createNotification } from "./notification.repository.js";

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
