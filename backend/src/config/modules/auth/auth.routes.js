import express from "express";
import { login, refresh, logout } from "./auth.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);

// test protected route
router.get("/me", authMiddleware, (req, res) => {
    res.json({ user: req.user });
});

export default router;