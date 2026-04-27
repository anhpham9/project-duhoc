import express from "express";
import { login, refresh, logout } from "./auth.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);

// test protected route
import User from "../users/user.model.js";
import UserRole from "../userRoles/userRole.model.js";
import { getUserPermissions } from "../permissions/permission.service.js";
import Role from "../roles/role.model.js";

router.get("/me", authMiddleware, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: ["id", "name", "username", "email", "last_login"],
            include: {
                model: Role,
                attributes: ["id", "code", "description"],
                through: { attributes: [] },
            },
        });
        if (!user) return res.status(404).json({ message: "User not found" });
        // Lấy permissions tổng hợp từ các role
        const permissions = await getUserPermissions(user.id);
        res.json({ ...user.toJSON(), permissions });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

export default router;