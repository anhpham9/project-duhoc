import express from "express";
import { resetUserPassword } from "./user.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { userRbacMiddleware } from "../../middlewares/user-rbac.middleware.js";
import {
    getAllUsers,
    getAllUsersWithPagination,
    getUserById,
    createUser,
    updateUser,
    deleteUser
} from "./user.controller.js";
import { getProfile, updateProfile, changeProfilePassword, getActivityLogs } from "./profile.controller.js";

const router = express.Router();

import { getUserRoleIds } from "../../middlewares/user-rbac.helper.js";

// Custom middleware: chỉ chặn editor/consultant truy cập getAllUsers
const canListUsers = async (req, res, next) => {
    const roleIds = await getUserRoleIds(req.user.id);
    // 1-superadmin, 2-admin, 3-manager được phép
    if (roleIds.some(r => [1,2,3].includes(r))) return next();
    return res.status(403).json({ message: "Forbidden" });
};

// Profile routes
router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);
router.put("/profile/password", authMiddleware, changeProfilePassword);
router.get("/profile/activity-logs", authMiddleware, getActivityLogs);

// Manage Users routes
router.get("/", authMiddleware, canListUsers, getAllUsersWithPagination);
router.get("/exportToExcel", authMiddleware, canListUsers, getAllUsers);
router.get("/:id", authMiddleware, userRbacMiddleware("read"), getUserById);
router.post("/", authMiddleware, userRbacMiddleware("create"), createUser);
router.put("/:id", authMiddleware, userRbacMiddleware("update"), updateUser);
router.delete("/:id", authMiddleware, userRbacMiddleware("delete"), deleteUser);
// Đặt lại mật khẩu user
router.post("/:id/reset-password", authMiddleware, resetUserPassword);

export default router;