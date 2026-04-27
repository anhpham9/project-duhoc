import * as userRepo from "./user.repository.js";
import { sendNotification } from "../notifications/notification.service.js";
import { logAudit } from "../../utils/auditLogger.js";
import { logActivity } from "../../utils/activityLogger.js";

export const getAllUsers = async (req, res) => {
    const users = await userRepo.getAllUsersWithRoles();
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
    // Gửi notification cho user mới
    await sendNotification({
        user_id: user.id,
        type: "user",
        action: "created",
        title: "Tài khoản của bạn đã được tạo",
        message: `Tài khoản ${user.username} đã được tạo bởi quản trị viên.`,
        entity_type: "user",
        entity_id: id,
        data: { created_by: req.user.id }
    });
    // Ghi vào audit_logs
    await logAudit({
        user_id: req.user.id,
        action: "create",
        entity_type: "user",
        entity_id: user.id,
        data: { after: user },
        ip_address: req.ip,
        user_agent: req.headers["user-agent"]
    });
    res.json({ user });
};

export const updateUser = async (req, res) => {
    const { id } = req.params;
    const data = { ...req.body };
    
    const currentUserId = req.user.id;
    const isSelf = String(currentUserId) === String(id);
    const oldUser = await userRepo.getUserById(id);
    // Xóa các trường không hợp lệ
    delete data.Roles;
    delete data.role_id;
    delete data.id;
    delete data.created_at;
    delete data.updated_at;
    delete data.deleted_at;
    delete data.last_login;
    delete data.created_by;
    delete data.password;

    // Chỉ update trường thực sự thay đổi
    const changedFields = {};
    for (const key in data) {
        if (data[key] !== oldUser[key]) {
            changedFields[key] = data[key];
        }
    }
    let updatedUser = oldUser;
    if (Object.keys(changedFields).length > 0) {
        await userRepo.updateUser(id, changedFields);
        updatedUser = await userRepo.getUserById(id);
    }

    // Chỉ gán lại role nếu role_id khác role hiện tại
    if (req.body.role_id) {
        const currentRoleId = oldUser.Roles && oldUser.Roles.length ? oldUser.Roles[0].id : null;
        if (Number(req.body.role_id) !== Number(currentRoleId)) {
            await userRepo.assignRoleToUser(id, req.body.role_id);
            updatedUser = await userRepo.getUserById(id);
        }
    }

    if (isSelf) {
        await logActivity({
            user_id: currentUserId,
            action: "update",
            entity_type: "user",
            entity_id: id,
            data: { before: oldUser, after: updatedUser }
        });
    } else {
        await sendNotification({
            user_id: id,
            type: "user",
            action: "updated",
            title: "Tài khoản của bạn đã được cập nhật",
            message: `Tài khoản của bạn vừa được cập nhật bởi quản trị viên.`,
            entity_type: "user",
            entity_id: id,
            data: { updated_by: currentUserId }
        });
        await logAudit({
            user_id: currentUserId,
            action: "update",
            entity_type: "user",
            entity_id: id,
            data: { before: oldUser, after: updatedUser },
            ip_address: req.ip,
            user_agent: req.headers["user-agent"]
        });
    }
    res.json({ success: true });
};

export const deleteUser = async (req, res) => {
    const { id } = req.params;
    const oldUser = await userRepo.getUserById(id);
    await userRepo.deleteUserById(id);
    // Ghi vào audit_logs
    await logAudit({
        user_id: req.user.id,
        action: "delete",
        entity_type: "user",
        entity_id: id,
        data: { before: oldUser },
        ip_address: req.ip,
        user_agent: req.headers["user-agent"]
    });
    res.json({ success: true });
};

export const assignRoleToUser = async (req, res) => {
    const { userId, roleId } = req.body;

    await userRepo.assignRoleToUser(userId, roleId);

    res.json({ message: "Role assigned" });
};

