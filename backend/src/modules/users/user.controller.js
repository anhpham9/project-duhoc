import * as userRepo from "./user.repository.js";

export const getAllUsers = async (req, res) => {
    const users = await userRepo.getAllUsers();
    res.json({ users });
};

export const getUserById = async (req, res) => {
    const { id } = req.params;
    const user = await userRepo.getUserById(id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
};

export const createUser = async (req, res) => {
    const data = req.body;
    if (!data.username || !data.password) return res.status(400).json({ message: "Missing username or password" });
    const user = await userRepo.createUser(data);
    res.json({ user });
};

export const updateUser = async (req, res) => {
    const { id } = req.params;
    const data = req.body;
    await userRepo.updateUser(id, data);
    res.json({ success: true });
};

export const deleteUser = async (req, res) => {
    const { id } = req.params;
    await userRepo.deleteUserById(id);
    res.json({ success: true });
};

export const assignRoleToUser = async (req, res) => {
    const { userId, roleId } = req.body;

    await userRepo.assignRoleToUser(userId, roleId);

    res.json({ message: "Role assigned" });
};

