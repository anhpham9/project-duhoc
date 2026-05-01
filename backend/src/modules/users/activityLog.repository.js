import { Op } from "sequelize";
import ActivityLog from "../auth/activityLog.model.js";
import User from "./user.model.js";
import Role from "../roles/role.model.js";
import Permission from "../permissions/permission.model.js";
import UserRole from "../userRoles/userRole.model.js";
import sequelize from "../../db/index.js";

// Lấy activity logs của user, mặc định lấy 50 log mới nhất
export async function findLogsByUser(user_id, { limit = 50, offset = 0 } = {}) {
    return ActivityLog.findAll({
        where: { user_id },
        order: [["created_at", "DESC"]],
        limit,
        offset
    });
}