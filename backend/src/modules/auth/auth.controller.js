import { verifyToken, generateAccessToken, generateRefreshToken } from "../../utils/jwt.js";
import { findRefreshToken, saveRefreshToken } from "./auth.service.js";
import bcrypt from "bcrypt";

const fakeUser = {
    id: 1,
    email: "test@gmail.com",
    password: bcrypt.hashSync("123456", 10),
};

export const login = async (req, res) => {
    const user = { id: 1 }; // giả lập

    const accessToken = generateAccessToken({ id: user.id });
    const refreshToken = generateRefreshToken({ id: user.id });

    // lưu DB
    await saveRefreshToken(user.id, refreshToken);

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