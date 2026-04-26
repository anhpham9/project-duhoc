// định nghĩa các hàm tương tác với DB liên quan đến permissions, không chứa logic nghiệp vụ
import Permission from "./permission.model.js";
import RolePermission from "../rolePermissions/rolePermission.model.js";

export const getAllPermissions = async () => {
    return Permission.findAll();
};

export const createPermission = async (code, description) => {
    return Permission.create({ code, description });
};

export const deletePermissionById = async (id) => {
    return Permission.destroy({ where: { id } });
};

export const getRolePermissions = async (roleId) => {
    return RolePermission.findAll({ where: { role_id: roleId } });
};

export const setRolePermissions = async (roleId, permissionIds) => {
    await RolePermission.destroy({ where: { role_id: roleId } });
    for (const pid of permissionIds) {
        await RolePermission.create({ role_id: roleId, permission_id: pid });
    }
    return true;
};
