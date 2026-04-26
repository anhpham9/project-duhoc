// utils/activityLogger.js
import ActivityLog from "../modules/auth/activityLog.model.js";

/**
 * Ghi log hoạt động của user
 * @param {Object} params
 * @param {number} params.user_id - ID user thực hiện
 * @param {string} params.action - Hành động (login, logout, refresh_token...)
 * @param {string} [params.object_type] - Loại đối tượng tác động
 * @param {number} [params.object_id] - ID đối tượng tác động
 * @param {Object} [params.data] - Dữ liệu bổ sung (JSON)
 */
export async function logActivity({ user_id, action, object_type = null, object_id = null, data = null }) {
    try {
        await ActivityLog.create({
            user_id,
            action,
            object_type,
            object_id,
            data,
        });
    } catch (err) {
        // Không throw để không ảnh hưởng flow chính
        console.error('Activity log error:', err);
    }
}