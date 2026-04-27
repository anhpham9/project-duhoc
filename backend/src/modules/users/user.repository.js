import User from "./user.model.js";
import Role from "../roles/role.model.js";
import Permission from "../permissions/permission.model.js";
import UserRole from "../userRoles/userRole.model.js";
import sequelize from "../../db/index.js";

export const getAllUsers = async () => {
    return User.findAll();
};

export const getAllUsersWithRoles = async () => {
    return User.findAll({
        include: {
            model: Role,
            attributes: ["id", "code", "description"],
            through: { attributes: [] },
        },
    });
};

export const getUserById = async (id) => {
    return User.findByPk(id);
};

export const getUserByUsername = async (username) => {
    return User.findOne({ where: { username } });
};

export const createUser = async (data) => {
    return User.create(data);
};

export const updateUser = async (id, data) => {
    return User.update(data, { where: { id } });
};

export const deleteUserById = async (id) => {
    return User.destroy({ where: { id } });
};

export const getUserWithRolesAndPermissions = async (userId) => {
    return User.findByPk(userId, {
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
};

/**
 * Gán role cho user (chỉ 1 role)
 * - Xóa hết role cũ, gán role mới
 * - Dùng transaction để đảm bảo an toàn
 */
export const assignRoleToUser = async (userId, roleId) => {
    return sequelize.transaction(async (t) => {
        await UserRole.destroy({ where: { user_id: userId }, transaction: t });
        await UserRole.create({ user_id: userId, role_id: roleId }, { transaction: t });
    });
};
