import { verifyToken, generateAccessToken, generateRefreshToken } from "../../utils/jwt.js";
import { findRefreshToken, saveRefreshToken } from "./auth.service.js";
import bcrypt from "bcrypt";
import User from "../users/user.model.js";
import UserSession from "./userSession.model.js";
import crypto from "crypto";

export const login = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: "Missing username or password" });
    }
    const user = await User.findOne({ where: { username } });
    if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
        return res.status(401).json({ message: "Invalid username or password" });
    }

    // Cập nhật last_login
    user.last_login = new Date();
    await user.save();

    const accessToken = generateAccessToken({ id: user.id });
    const refreshToken = generateRefreshToken({ id: user.id });

    // Lưu user session (hash refreshToken)
    const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
    await UserSession.create({
        user_id: user.id,
        refresh_token_hash: refreshTokenHash,
        ip_address: req.ip,
        user_agent: req.headers["user-agent"] || null,
        expired_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 ngày
    });

    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: false, // true nếu HTTPS
        sameSite: "lax",
    });

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false, // true nếu HTTPS
        sameSite: "lax",
    });

    res.json({ message: "Login success" });
};

export const refresh = async (req, res) => {
    const token = req.cookies.refreshToken;

    if (!token) {
        return res.status(401).json({ message: "No refresh token" });
    }

    try {
        const decoded = verifyToken(token, process.env.JWT_REFRESH_SECRET);

        // check DB
        const exists = await findRefreshToken(token);
        if (!exists) throw new Error();

        const newAccessToken = generateAccessToken({ id: decoded.id });

        res.cookie("accessToken", newAccessToken, {
            httpOnly: true,
            secure: false, // true nếu HTTPS
            sameSite: "lax",
        });

        res.json({ message: "Refreshed" });
    } catch {
        res.status(403).json({ message: "Invalid refresh token" });
    }
};

export const logout = (req, res) => {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.json({ message: "Logged out" });
};