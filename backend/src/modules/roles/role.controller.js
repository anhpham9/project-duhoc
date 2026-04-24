export const assignPermissionToRole = async (req, res) => {
    const { roleId, permissionId } = req.body;

    await sequelize.models.role_permissions.create({
        role_id: roleId,
        permission_id: permissionId,
    });

    res.json({ message: "Permission assigned" });
};