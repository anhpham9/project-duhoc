import crypto from "crypto";
import * as userRepo from "./user.repository.js";
import { sendNotification } from "../notifications/notification.service.js";
import { logAudit } from "../../utils/auditLogger.js";
import { logActivity } from "../../utils/activityLogger.js";
import { validateUser, validateUpdateUser } from "./user.validation.js";

// Lấy danh sách user có hỗ trợ tìm kiếm, lọc, sắp xếp
export const getAllUsers = async (req, res) => {
    const {
        search = "",
        role,
        active,
        sort_by = "id",
        sort_dir = "asc",
        page = 1,
        page_size = 20
    } = req.query;

    const { users, total } = await userRepo.searchUsersWithFilters({
        search,
        role,
        active,
        sort_by,
        sort_dir,
        page: Number(page),
        page_size: page_size === 'all' ? 'all' : Number(page_size)
    });
    res.json({ users, total });
};

export const getUserById = async (req, res) => {
    const { id } = req.params;
    const user = await userRepo.getUserById(id);
    if (!user) return res.status(404).json({ message: "USER_NOT_FOUND" });
    res.json({ user });
};

export const createUser = async (req, res) => {
    const data = req.body;
    // Validate fields
    const errors = validateUser(data);
    if (Object.keys(errors).length > 0) {
        return res.status(400).json({ message: "USER_VALIDATION_FAILED", errors });
    }
    // Check duplicate username/email
    const existingUserByUsername = await userRepo.findUserByUsername(data.username);
    if (existingUserByUsername) {
        return res.status(409).json({ message: "USERNAME_EXISTS" });
    }
    const existingUserByEmail = await userRepo.findUserByEmail(data.email);
    if (existingUserByEmail) {
        return res.status(409).json({ message: "EMAIL_EXISTS" });
    }
    // Bắt buộc phải có role_ids
    if (!Array.isArray(data.role_ids) || data.role_ids.length === 0) {
        return res.status(400).json({ message: "ROLE_REQUIRED" });
    }
    // Tạo user và gán role, rollback nếu lỗi
    let user;
    try {
        user = await userRepo.createUser(data);
        await userRepo.assignRolesToUser(user.id, data.role_ids);
    } catch (err) {
        if (user && user.id) {
            await userRepo.deleteUserById(user.id);
        }
        return res.status(500).json({ message: "ASSIGN_ROLE_FAILED" });
    }
    // Gửi notification cho user mới
    await sendNotification({
        user_id: user.id,
        type: "user",
        action: "created",
        title: "USER_CREATED",
        message: "USER_CREATED_BY_ADMIN",
        entity_type: "user",
        entity_id: user.id,
        data: { username: user.username }
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

    const userId = req.params.id;
    const data = { ...req.body };
    // Tách role_ids khỏi data để validation
    const { role_ids } = data;
    delete data.role_ids;

    // Xóa các trường không hợp lệ nếu có trong payload
    delete data.id;
    delete data.last_login;
    delete data.created_by;
    delete data.deleted_at;
    delete data.created_at;
    delete data.updated_at;
    delete data.Roles;

    // Validate fields
    const errors = validateUpdateUser(data);
    if (Object.keys(errors).length > 0) {
        return res.status(400).json({ message: "USER_VALIDATION_FAILED", errors });
    }
    // Check duplicate username/email (phải khác id hiện tại)
    const existingUserByUsername = await userRepo.findUserByUsername(data.username);
    if (existingUserByUsername && String(existingUserByUsername.id) !== String(userId)) {
        return res.status(409).json({ message: "USERNAME_EXISTS" });
    }
    const existingUserByEmail = await userRepo.findUserByEmail(data.email);
    if (existingUserByEmail && String(existingUserByEmail.id) !== String(userId)) {
        return res.status(409).json({ message: "EMAIL_EXISTS" });
    }
    // Bắt buộc phải có role_ids
    if (!Array.isArray(role_ids) || role_ids.length === 0) {
        return res.status(400).json({ message: "ROLE_REQUIRED" });
    }
    // Update user
    try {
        // console.log("Updating user in DB", { userId, data });
        await userRepo.updateUser(userId, data);
        // console.log("Updating user roles in DB", { userId, role_ids });
        await userRepo.assignRolesToUser(userId, role_ids);
    } catch (err) {
        return res.status(500).json({ message: "USER_UPDATE_FAILED" });
    }
    const user = await userRepo.getUserById(userId);
    // Gửi notification cho user
    await sendNotification({
        user_id: user.id,
        type: "user",
        action: "updated",
        title: "USER_UPDATED",
        message: "USER_UPDATED_BY_ADMIN",
        entity_type: "user",
        entity_id: user.id,
        data: { updated_by: req.user.id, username: user.username }
    });
    // Ghi vào audit_logs
    await logAudit({
        user_id: req.user.id,
        action: "update",
        entity_type: "user",
        entity_id: user.id,
        data: { after: user },
        ip_address: req.ip,
        user_agent: req.headers["user-agent"]
    });
    res.json({ user });
};

export const deleteUser = async (req, res) => {
    const { id } = req.params;
    const oldUser = await userRepo.getUserById(id);
    // Xóa tất cả user_roles liên kết trước khi xóa user
    await userRepo.deleteUserRolesByUserId(id);
    await userRepo.deleteUserById(id);
    // Gửi notification cho quản trị viên
    await sendNotification({
        user_id: oldUser.id,
        type: "user",
        action: "deleted",
        title: "USER_DELETED",
        message: "USER_DELETED_BY_ADMIN",
        entity_type: "user",
        entity_id: oldUser.id,
        data: { deleted_by: req.user.id, username: oldUser.username }
    });
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

// Hàm sinh mật khẩu ngẫu nhiên
function generateRandomPassword(length = 12) {
    return crypto.randomBytes(length).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, length);
}

// API: Reset mật khẩu user
export const resetUserPassword = async (req, res) => {
    const userId = req.params.id;
    const user = await userRepo.getUserById(userId);
    if (!user) return res.status(404).json({ message: "USER_NOT_FOUND" });
    const newPassword = generateRandomPassword(12);
    // Hash password nếu cần (giả sử userRepo.updateUser sẽ hash nếu cần)
    await userRepo.updateUser(userId, { password: newPassword });
    // Gửi notification cho user
    await sendNotification({
        user_id: user.id,
        type: "user",
        action: "reset_password",
        title: "USER_PASSWORD_RESET",
        message: "USER_PASSWORD_RESET_BY_ADMIN",
        entity_type: "user",
        entity_id: user.id,
        data: { reset_by: req.user.id, username: user.username, password:newPassword },
    });
    // Ghi log mật khẩu mới (sau này sẽ gửi email)
    await logAudit({
        user_id: req.user.id,
        action: "reset_password",
        entity_type: "user",
        entity_id: userId,
        data: { username: user.username, password: newPassword },
        ip_address: req.ip,
        user_agent: req.headers["user-agent"]
    });
    res.json({ newPassword });
};