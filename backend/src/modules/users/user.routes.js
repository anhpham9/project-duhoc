import express from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { userRbacMiddleware } from "../../middlewares/user-rbac.middleware.js";
import {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    assignRoleToUser
} from "./user.controller.js";

const router = express.Router();

import { getUserRoleIds } from "../../middlewares/user-rbac.helper.js";

// Custom middleware: chỉ chặn editor/consultant truy cập getAllUsers
const canListUsers = async (req, res, next) => {
    const roleIds = await getUserRoleIds(req.user.id);
    // 1-superadmin, 2-admin, 3-manager được phép
    if (roleIds.some(r => [1,2,3].includes(r))) return next();
    return res.status(403).json({ message: "Forbidden" });
};

router.get("/", authMiddleware, canListUsers, getAllUsers);
router.get("/:id", authMiddleware, userRbacMiddleware("read"), getUserById);
router.post("/", authMiddleware, userRbacMiddleware("create"), createUser);
router.put("/:id", authMiddleware, userRbacMiddleware("update"), updateUser);
router.delete("/:id", authMiddleware, userRbacMiddleware("delete"), deleteUser);
router.post("/assign-role", authMiddleware, userRbacMiddleware("update"), assignRoleToUser);

export default router;