import * as roleRepo from "./role.repository.js";

export const getAllRoles = async (req, res) => {
    const roles = await roleRepo.getAllRoles();
    res.json({ roles });
};

export const getRoleById = async (req, res) => {
    const { id } = req.params;
    const role = await roleRepo.getRoleById(id);
    if (!role) return res.status(404).json({ message: "Role not found" });
    res.json({ role });
};

export const createRole = async (req, res) => {
    const { code, description } = req.body;
    if (!code) return res.status(400).json({ message: "Missing code" });
    const role = await roleRepo.createRole(code, description);
    res.json({ role });
};

export const updateRole = async (req, res) => {
    const { id } = req.params;
    const data = req.body;
    await roleRepo.updateRole(id, data);
    res.json({ success: true });
};

export const deleteRole = async (req, res) => {
    const { id } = req.params;
    await roleRepo.deleteRoleById(id);
    res.json({ success: true });
};

export const assignPermissionToRole = async (req, res) => {
    const { roleId, permissionId } = req.body;

    await roleRepo.assignPermissionToRole(roleId, permissionId);

    res.json({ message: "Permission assigned" });
};