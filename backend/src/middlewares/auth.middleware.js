import { verifyToken } from "../utils/jwt.js";

export const authMiddleware = (req, res, next) => {
    const token = req.cookies.accessToken;

    if (!token) return res.status(401).json({ message: "Unauthorized" });

    try {
        const decoded = verifyToken(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: "Token expired" });
    }
};