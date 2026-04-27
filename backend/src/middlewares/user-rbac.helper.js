import User from "../modules/users/user.model.js";
import UserRole from "../modules/userRoles/userRole.model.js";
import Role from "../modules/roles/role.model.js";

/**
 * Lấy tất cả role_id của user
 * @param {number} userId
 * @returns {Promise<string[]>}
 */
export async function getUserRoleIds(userId) {
    const roles = await UserRole.findAll({
        where: { user_id: userId },
        attributes: ["role_id"]
    });
    return roles.map(r => r.role_id).filter(Boolean);
}

/**
 * Kiểm tra quyền thao tác user theo RBAC đặc biệt
 * @param {object} currentUser - user đang đăng nhập (req.user)
 * @param {object} targetUser - user bị tác động (object hoặc id)
 * @param {string} action - create|read|update|delete
 * @returns {Promise<boolean>}
 */
export async function canManageUser(currentUser, targetUser, action) {
    // Lấy role_id của currentUser và targetUser
    const currentRoleIds = await getUserRoleIds(currentUser.id);
    const targetRoleIds = Array.isArray(targetUser.role_ids)
        ? targetUser.role_ids
        : await getUserRoleIds(targetUser.id || targetUser);
    // Mapping: 1-superadmin, 2-admin, 3-manager, 4-editor, 5-consultant
    if (currentRoleIds.includes(1)) return true;
    if (currentRoleIds.includes(2)) {
        return targetRoleIds.some(r => [3,4,5].includes(r));
    }
    if (currentRoleIds.includes(3)) {
        if (action === "delete") return false;
        return targetRoleIds.some(r => [4,5].includes(r));
    }
    if (currentRoleIds.some(r => [4,5].includes(r))) {
        return currentUser.id === (targetUser.id || targetUser) && ["read", "update"].includes(action);
    }
    return false;
}
