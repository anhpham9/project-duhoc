import express from "express";
import ActivityLog from "../auth/activityLog.model.js";
import User from "../users/user.model.js";

const router = express.Router();

// Lấy lịch sử hoạt động (admin)
// GET /api/activity-logs?user_id=&action=&limit=&offset=
router.get("/", async (req, res) => {
    try {
        const { user_id, action, limit = 20, offset = 0 } = req.query;
        const where = {};
        if (user_id) where.user_id = user_id;
        if (action) where.action = action;
        console.log("Fetching activity logs with:", { where, limit, offset });
        const logs = await ActivityLog.findAll({
            where,
            include: [{ model: User, attributes: ["id", "name", "username", "email"] }],
            order: [["created_at", "DESC"]],
            limit: Number(limit),
            offset: Number(offset),
        });
        console.log("Fetched logs:", logs.map(l => l.toJSON ? l.toJSON() : l));
        res.json({ logs });
    } catch (err) {
        console.error("Error fetching activity logs:", err);
        res.status(500).json({ message: "Lỗi lấy activity logs", error: err.message });
    }
});

export default router;
