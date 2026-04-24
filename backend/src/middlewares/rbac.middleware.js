export const checkPermission = (permission) => {
    return async (req, res, next) => {
        const userPermissions = await getUserPermissions(req.user.id);

        if (!userPermissions.includes(permission)) {
            return res.status(403).json({ message: "Forbidden" });
        }

        next();
    };
};