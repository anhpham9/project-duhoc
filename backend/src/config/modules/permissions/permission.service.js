import User from "../modules/users/user.model.js";
import Role from "../modules/roles/role.model.js";
import Permission from "../modules/permissions/permission.model.js";

const permissionCache = new Map();

export const getUserPermissions = async (userId) => {
    if (permissionCache.has(userId)) {
        return permissionCache.get(userId);
    }

    const user = await User.findByPk(userId, {
        include: {
            model: Role,
            include: {
                model: Permission,
                attributes: ["code"],
                through: { attributes: [] },
            },
            attributes: ["id"],
            through: { attributes: [] },
        },
    });

    if (!user) return [];

    const permissions = user.Roles.flatMap((role) =>
        role.Permissions.map((p) => p.code)
    );

    const uniquePermissions = [...new Set(permissions)];

    permissionCache.set(userId, uniquePermissions);

    return uniquePermissions;
};

// Clear cache when user permissions are updated
export const clearPermissionCache = (userId) => {
    permissionCache.delete(userId);
};