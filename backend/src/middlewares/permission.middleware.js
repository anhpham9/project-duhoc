import { getUserPermissions } from "../services/permission.service.js";

export const authorize = ({ permissions = [], roles = [] } = {}) => {
    return async (req, res, next) => {
        try {
            const userId = req.user?.id;

            if (!userId) {
                return res.status(401).json({ message: "Unauthorized" });
            }

            const userPermissions = await getUserPermissions(userId);

            // check permission
            if (permissions.length > 0) {
                const hasPermission = permissions.every((p) =>
                    userPermissions.includes(p)
                );

                if (!hasPermission) {
                    return res.status(403).json({ message: "Forbidden (permission)" });
                }
            }

            next();
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Server error" });
        }
    };
};