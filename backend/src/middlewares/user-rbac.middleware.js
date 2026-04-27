import { getUserRoleIds, canManageUser } from "../middlewares/user-rbac.helper.js";
import * as userRepo from "../modules/users/user.repository.js";

/**
 * RBAC middleware cho user management
 * - Gán req.targetUser nếu có id param
 * - Kiểm tra quyền thao tác user
 * - Nếu không đủ quyền, trả về 403
 *
 * Sử dụng: userRbacMiddleware(action)
 */
export const userRbacMiddleware = (action) => async (req, res, next) => {
    try {
        const currentUser = req.user;
        let targetUser = null;
        if (req.params.id) {
            targetUser = await userRepo.getUserById(req.params.id);
            if (!targetUser) return res.status(404).json({ message: "User not found" });
            req.targetUser = targetUser;
        } else if (action === "create") {
            // Tạo user: targetUser là role_id trong body
            targetUser = { id: null, role_ids: req.body.role_ids ? req.body.role_ids : (req.body.role_id ? [req.body.role_id] : []) };
        } else {
            targetUser = { id: currentUser.id, role_ids: await getUserRoleIds(currentUser.id) };
        }
        const allowed = await canManageUser(currentUser, targetUser, action);
        if (!allowed) return res.status(403).json({ message: "Forbidden by RBAC" });
        next();
    } catch (err) {
        console.error("userRbacMiddleware error:", err);
        res.status(500).json({ message: "Internal error", error: err.message });
    }
};
