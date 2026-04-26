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
router.get("/me", authMiddleware, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: ["id", "name", "username", "email", "last_login"]
        });
        if (!user) return res.status(404).json({ message: "User not found" });
        // Lấy role_ids
        const userRoles = await UserRole.findAll({ where: { user_id: user.id } });
        const role_ids = userRoles.map(r => Number(r.role_id));
        res.json({ ...user.toJSON(), role_ids });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

export default router;