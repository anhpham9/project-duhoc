
import { verifyToken, generateAccessToken, generateRefreshToken } from "../../utils/jwt.js";
import { findRefreshToken, saveRefreshToken, deleteRefreshToken } from "./auth.service.js";
import bcrypt from "bcrypt";
import User from "../users/user.model.js";
import UserSession from "./userSession.model.js";
import crypto from "crypto";
import { logActivity } from "../../utils/activityLogger.js";

export const login = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: "LOGIN_MISSING_CREDENTIALS" });
    }
    const user = await User.findOne({ where: { username } });
    if (!user) {
        return res.status(401).json({ message: "LOGIN_FAILED" });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
        return res.status(401).json({ message: "LOGIN_FAILED" });
    }
    if (user.is_active === false) {
        return res.status(403).json({ message: "LOGIN_ACCOUNT_INACTIVE" });
    }

    // Cập nhật last_login
    user.last_login = new Date();
    await user.save();

    const accessToken = generateAccessToken({ id: user.id });
    const refreshToken = generateRefreshToken({ id: user.id });

    // Lưu user session (hash refreshToken)
    await saveRefreshToken(user.id, refreshToken, req);

    // Ghi log hoạt động login
    logActivity({
        user_id: user.id,
        action: "login",
        entity_type: "user",
        entity_id: user.id,
        data: { ip: req.ip, user_agent: req.headers["user-agent"] }
    });

    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: false, // true nếu HTTPS
        sameSite: "lax",
        // maxAge: 15 * 60 * 1000 // 15 phút // hết hạn khi đóng trình duyệt, không set maxAge
    });

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false, // true nếu HTTPS
        sameSite: "lax",
        // maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
    });

    res.json({ message: "LOGIN_SUCCESS" });
};

export const refresh = async (req, res) => {
    const token = req.cookies.refreshToken;

    if (!token) {
        return res.status(401).json({ message: "REFRESH_TOKEN_MISSING" });
    }

    try {
        const decoded = verifyToken(token, process.env.JWT_REFRESH_SECRET);

        // check DB
        const exists = await findRefreshToken(token);
        if (!exists) throw new Error();

        // Xóa refreshToken cũ
        await deleteRefreshToken(token);

        // Sinh refreshToken mới và lưu lại session
        const newRefreshToken = generateRefreshToken({ id: decoded.id });
        await saveRefreshToken(decoded.id, newRefreshToken, req);

        const newAccessToken = generateAccessToken({ id: decoded.id });

        // Ghi log hoạt động refresh_token
        logActivity({
            user_id: decoded.id,
            action: "refresh_token",
            entity_type: "user",
            entity_id: decoded.id,
            data: { ip: req.ip, user_agent: req.headers["user-agent"] }
        });

        res.cookie("accessToken", newAccessToken, {
            httpOnly: true,
            secure: false, // true nếu HTTPS
            sameSite: "lax",
        });

        res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: false, // true nếu HTTPS
            sameSite: "lax",
            // maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
        });

        res.json({ message: "REFRESH_SUCCESS" });
    } catch {
        res.status(403).json({ message: "REFRESH_TOKEN_INVALID" });
    }
};

export const logout = async (req, res) => {
    let userId = null;
    try {
        const refreshToken = req.cookies.refreshToken;
        if (refreshToken) {
            // Giải mã để lấy user id nếu có thể
            try {
                const decoded = verifyToken(refreshToken, process.env.JWT_REFRESH_SECRET);
                userId = decoded.id;
            } catch {}
            await deleteRefreshToken(refreshToken);
        }
    } catch (err) {
        // Không throw lỗi ra ngoài, chỉ log nếu cần
        // console.error("Logout session cleanup error", err);
    }
    // Ghi log hoạt động logout
    if (userId) {
        logActivity({
            user_id: userId,
            action: "logout",
            entity_type: "user",
            entity_id: userId,
            data: { ip: req.ip, user_agent: req.headers["user-agent"] }
        });
    }
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.json({ message: "LOGOUT_SUCCESS" });
};