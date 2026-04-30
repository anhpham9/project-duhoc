import User from "../modules/users/user.model.js";
import Role from "../modules/roles/role.model.js";
import Permission from "../modules/permissions/permission.model.js";
import UserRole from "../modules/userRoles/userRole.model.js";
import RolePermission from "../modules/rolePermissions/rolePermission.model.js";
import ActivityLog from "../modules/auth/activityLog.model.js";

// Self join để lấy thông tin người tạo
User.belongsTo(User, { as: 'creator', foreignKey: 'created_by' });

// User ↔ Role (qua UserRole)
User.belongsToMany(Role, {
    through: UserRole,
    foreignKey: "user_id",
    otherKey: "role_id"
});
Role.belongsToMany(User, {
    through: UserRole,
    foreignKey: "role_id",
    otherKey: "user_id"
});

// Role ↔ Permission (qua RolePermission)
Role.belongsToMany(Permission, {
    through: RolePermission,
    foreignKey: "role_id",
    otherKey: "permission_id"
});
Permission.belongsToMany(Role, {
    through: RolePermission,
    foreignKey: "permission_id",
    otherKey: "role_id"
});

// User - ActivityLog (1-n)
ActivityLog.belongsTo(User, { foreignKey: "user_id" });
User.hasMany(ActivityLog, { foreignKey: "user_id" });