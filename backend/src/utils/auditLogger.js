import AuditLog from "../modules/auth/auditLog.model.js";

/**
 * Ghi log audit (hành động quản trị)
 * @param {Object} params
 * @param {number} params.user_id - ID user thực hiện
 * @param {string} params.action - Hành động (create_user, update_user, ...)
 * @param {string} [params.entity_type] - Loại đối tượng tác động
 * @param {number} [params.entity_id] - ID đối tượng tác động
 * @param {Object} [params.data] - Dữ liệu bổ sung (JSON)
 * @param {string} [params.ip_address]
 * @param {string} [params.user_agent]
 */
export async function logAudit({ user_id, action, entity_type = null, entity_id = null, data = null, ip_address = null, user_agent = null }) {
    try {
        await AuditLog.create({
            user_id,
            action,
            entity_type,
            entity_id,
            data,
            ip_address,
            user_agent,
        });
    } catch (err) {
        // Không throw để không ảnh hưởng flow chính
        console.error('Audit log error:', err);
    }
}
