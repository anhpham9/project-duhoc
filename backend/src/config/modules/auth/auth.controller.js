
import { verifyToken, generateAccessToken, generateRefreshToken } from "../../utils/jwt.js";
import { findRefreshToken, saveRefreshToken } from "./auth.service.js";
import bcrypt from "bcrypt";
import User from "../users/user.model.js";

export const login = async (req, res) => {
    console.log('LOGIN BODY:', req.body);
    console.log('JWT_SECRET:', process.env.JWT_SECRET);
    console.log('JWT_REFRESH_SECRET:', process.env.JWT_REFRESH_SECRET);
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

    const accessToken = generateAccessToken({ id: user.id });
    const refreshToken = generateRefreshToken({ id: user.id });
    await saveRefreshToken(user.id, refreshToken);

    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: true, // true nếu HTTPS hoặc dev khác port
        sameSite: "none",
    });
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true, // true nếu HTTPS hoặc dev khác port
        sameSite: "none",
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
            secure: true, // true nếu HTTPS hoặc dev khác port
            sameSite: "none",
        });

        res.json({ message: "Refreshed" });
    } catch {
        res.status(403).json({ message: "Invalid refresh token" });
    }
};

export const logout = (req, res) => {
    res.clearCookie("accessToken", { sameSite: "none", secure: true });
    res.clearCookie("refreshToken", { sameSite: "none", secure: true });
    res.json({ message: "Logged out" });
};