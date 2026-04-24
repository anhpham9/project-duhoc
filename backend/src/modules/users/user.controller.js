export const assignRoleToUser = async (req, res) => {
    const { userId, roleId } = req.body;

    await sequelize.models.user_roles.create({
        user_id: userId,
        role_id: roleId,
    });

    res.json({ message: "Role assigned" });
};

