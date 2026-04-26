// middlewares/superadmin.middleware.js
import User from "../modules/users/user.model.js";
import UserRole from "../modules/userRoles/userRole.model.js";

export const superadminMiddleware = async (req, res, next) => {
    try {
        // user_id đã được gán ở authMiddleware
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: "Unauthorized" });
        // Kiểm tra user có role_id = 1 (superadmin)
        const userRole = await UserRole.findOne({ where: { user_id: userId, role_id: 1 } });
        // console.log("Check superadmin for user", userId, "result:", userRole);
        if (!userRole) return res.status(403).json({ message: "Forbidden: Superadmin only" });
        next();
    } catch (err) {
        console.error("Superadmin middleware error:", err);
        res.status(500).json({ message: "Internal error", error: err.message });
    }
};
