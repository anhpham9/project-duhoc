import User from "../modules/users/user.model.js";
import Role from "../modules/roles/role.model.js";
import Permission from "../modules/permissions/permission.model.js";
import UserRole from "../modules/userRoles/userRole.model.js";
import RolePermission from "../modules/rolePermissions/rolePermission.model.js";

// User ↔ Role
User.belongsToMany(Role, {
    through: UserRole,
    foreignKey: "user_id",
    otherKey: "role_code",
    targetKey: "code",
});

Role.belongsToMany(User, {
    through: UserRole,
    foreignKey: "role_code",
    otherKey: "user_id",
    sourceKey: "code",
});

// Role ↔ Permission
Role.belongsToMany(Permission, {
    through: RolePermission,
    foreignKey: "role_code",
    otherKey: "permission_code",
    sourceKey: "code",
    targetKey: "code",
});

Permission.belongsToMany(Role, {
    through: RolePermission,
    foreignKey: "permission_code",
    otherKey: "role_code",
    sourceKey: "code",
});