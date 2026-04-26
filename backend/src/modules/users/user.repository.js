import User from "./user.model.js";
import Role from "../roles/role.model.js";
import Permission from "../permissions/permission.model.js";

export const getAllUsers = async () => {
    return User.findAll();
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
