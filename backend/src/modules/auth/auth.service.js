
import crypto from "crypto";
import UserSession from "./userSession.model.js";

// Lưu refresh token vào DB (hash)
export const saveRefreshToken = async (userId, token, req) => {
    const refreshTokenHash = crypto.createHash("sha256").update(token).digest("hex");
    await UserSession.create({
        user_id: userId,
        refresh_token_hash: refreshTokenHash,
        ip_address: req?.ip || null,
        user_agent: req?.headers ? req.headers["user-agent"] : null,
        expired_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 ngày
    });
};

// Tìm refresh token trong DB (hash)
export const findRefreshToken = async (token) => {
    const refreshTokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const session = await UserSession.findOne({ where: { refresh_token_hash: refreshTokenHash } });
    return !!session;
};

// Xóa refresh token trong DB (hash)
export const deleteRefreshToken = async (token) => {
    const refreshTokenHash = crypto.createHash("sha256").update(token).digest("hex");
    await UserSession.destroy({ where: { refresh_token_hash: refreshTokenHash } });
};