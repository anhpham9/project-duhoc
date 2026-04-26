import Role from "./role.model.js";

export const getAllRoles = async () => {
    return Role.findAll();
};

export const getRoleById = async (id) => {
    return Role.findByPk(id);
};

export const createRole = async (code, description) => {
    return Role.create({ code, description });
};

export const updateRole = async (id, data) => {
    return Role.update(data, { where: { id } });
};

export const deleteRoleById = async (id) => {
    return Role.destroy({ where: { id } });
};
