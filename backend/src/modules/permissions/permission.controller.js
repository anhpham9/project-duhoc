//  xử lý logic nghiệp vụ, gọi repository để tương tác DB, trả về response
import * as roleRepo from "../roles/role.repository.js";
import * as permissionRepo from "./permission.repository.js";

export const getAllPermissions = async (req, res) => {
  const permissions = await permissionRepo.getAllPermissions();
  res.json({ permissions });
};

export const createPermission = async (req, res) => {
  const { code, description } = req.body;
  if (!code) return res.status(400).json({ message: "Missing code" });
  const perm = await permissionRepo.createPermission(code, description);
  res.json({ permission: perm });
};

export const deletePermission = async (req, res) => {
  const { id } = req.params;
  await permissionRepo.deletePermissionById(id);
  res.json({ success: true });
};

export const getRolePermissions = async (req, res) => {
  const { roleId } = req.params;
  const role = await roleRepo.getRoleById(roleId);
  if (!role) return res.status(404).json({ message: "Role not found" });
  const rolePerms = await permissionRepo.getRolePermissions(roleId);
  res.json({ rolePermissions: rolePerms });
};

export const setRolePermissions = async (req, res) => {
  const { roleId } = req.params;
  const { permissionIds } = req.body; // array
  if (!Array.isArray(permissionIds)) return res.status(400).json({ message: "permissionIds must be array" });
  await permissionRepo.setRolePermissions(roleId, permissionIds);
  res.json({ success: true });
};
