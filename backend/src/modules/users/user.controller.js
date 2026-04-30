import crypto from "crypto";
import * as userRepo from "./user.repository.js";
import { sendNotification } from "../notifications/notification.service.js";
import { logAudit } from "../../utils/auditLogger.js";
import { logActivity } from "../../utils/activityLogger.js";
import { validateUser, validateUpdateUser } from "./user.validation.js";

// RBAC helpers (dùng chung cho nhiều API)
export const rolePriority = role => {
    if (!role) return 0;
    if (role.code === 'superadmin') return 100;
    if (role.code === 'admin') return 90;
    if (role.code === 'manager') return 80;
    if (role.code === 'editor') return 70;
    if (role.code === 'consultant') return 60;
    return 0;
};

export function getHighestRole(user) {
    if (!user || !user.Roles || !user.Roles.length) return null;
    // Lấy role có priority lớn nhất (quyền cao nhất: số lớn nhất)
    const getRoleCode = r => r.code || (r.dataValues && r.dataValues.code);
    const getRoleObj = r => ({
        ...((r.dataValues) ? r.dataValues : r),
        code: getRoleCode(r)
    });
    return user.Roles
        .map(getRoleObj)
        .reduce((max, r) => rolePriority(r) > rolePriority(max) ? r : max, getRoleObj(user.Roles[0]));
}

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

    // Lọc theo quyền: chỉ thấy user có role thấp hơn hoặc bằng mình (trừ superadmin)
    const currentUser = await userRepo.getUserWithRolesAndPermissions(req.user.id);
    const myRole = getHighestRole(currentUser);
    let allowedRolePriority = null;
    if (myRole?.code !== 'superadmin') {
        allowedRolePriority = rolePriority(myRole);
    }

    // Lấy tất cả users matching search/role/active (KHÔNG phân trang ở repo)
    const { users: allUsers } = await userRepo.searchUsersWithFilters({
        search,
        role,
        active,
        sort_by,
        sort_dir,
        page: 1,
        page_size: 'all',
        allowedRolePriority: null // Không lọc RBAC ở repo
    });

    // Lọc RBAC ở đây
    let filteredUsers = allUsers;
    if (allowedRolePriority !== null) {
        filteredUsers = allUsers.filter(u => {
            if (!u.Roles || !u.Roles.length) return false;
            const getRoleCode = r => r.code || (r.dataValues && r.dataValues.code);
            const getRoleObj = r => ({ ...((r.dataValues) ? r.dataValues : r), code: getRoleCode(r) });
            const highest = u.Roles.map(getRoleObj).reduce((min, r) => rolePriority(r) < rolePriority(min) ? r : min, getRoleObj(u.Roles[0]));
            return rolePriority(highest) <= allowedRolePriority;
        });
    }

    // Sau khi lọc, phân trang thủ công
    let pagedUsers = filteredUsers;
    let totalFiltered = filteredUsers.length;
    let pageNum = Number(page);
    let pageSizeNum = page_size === 'all' ? 'all' : Number(page_size);
    if (pageSizeNum !== 'all') {
        const startIdx = (pageNum - 1) * pageSizeNum;
        pagedUsers = filteredUsers.slice(startIdx, startIdx + pageSizeNum);
    }
    res.json({ users: pagedUsers, total: totalFiltered });
};

export const getUserById = async (req, res) => {
    const { id } = req.params;
    const user = await userRepo.getUserById(id);
    if (!user) return res.status(404).json({ message: "USER_NOT_FOUND" });
    res.json({ user });
};

export const createUser = async (req, res) => {
    const data = { ...req.body };
    // Nếu phone là chuỗi rỗng, chuyển thành null để tránh lỗi unique
    if (data.phone === "") data.phone = null;
    // Gán created_by là id của user hiện tại nếu có
    if (req.user && req.user.id) {
        data.created_by = req.user.id;
    }
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

    // RBAC: kiểm tra quyền tạo user với role nào
    const currentUser = await userRepo.getUserWithRolesAndPermissions(req.user.id);
    const myRole = getHighestRole(currentUser);
    if (myRole?.code !== 'superadmin') {
        // Lấy danh sách role từ DB để kiểm tra code và priority
        const allRoles = await userRepo.getAllRoles();
        const assignedRoles = allRoles.filter(r => data.role_ids.includes(r.id));
        // Không cho gán role superadmin
        if (assignedRoles.some(r => r.code === 'superadmin')) {
            return res.status(403).json({ message: "FORBIDDEN_ASSIGN_SUPERADMIN" });
        }
        // Không cho tạo user có role cao hơn hoặc bằng mình
        if (assignedRoles.some(r => rolePriority(r) >= rolePriority(myRole))) {
            return res.status(403).json({ message: "FORBIDDEN_ROLE_LEVEL" });
        }
    }

    // Tạo user và gán role, rollback nếu lỗi
    let user;
    try {
        console.log("Created user", data);
        user = await userRepo.createUser(data);
        await userRepo.assignRolesToUser(user.id, data.role_ids);
    } catch (err) {
        if (user && user.id) {
            await userRepo.deleteUserById(user.id);
        }
        console.error(err);
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
    // Nếu phone là chuỗi rỗng, chuyển thành null để tránh lỗi unique
    if (data.phone === "") data.phone = null;
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

    // console.log("Received updateUser request for userId", userId, "with data", data, "and role_ids", role_ids);
    // Lấy role cao nhất của currentUser và user target
    const currentUser = await userRepo.getUserWithRolesAndPermissions(req.user.id);
    const targetUser = await userRepo.getUserWithRolesAndPermissions(userId);

    // console.log("Current user roles", currentUser.Roles);
    const myRole = getHighestRole(currentUser);
    const targetRole = getHighestRole(targetUser);

    // console.log("myRole", myRole?.code, "targetRole", targetRole?.code, "role_ids", role_ids);

    // Chỉ cấm thao tác nếu KHÔNG phải superadmin
    if (myRole?.code !== 'superadmin') {
        // Cấm thao tác với user có role >= mình
        if (rolePriority(targetRole) >= rolePriority(myRole)) {
            return res.status(403).json({ message: "FORBIDDEN_ROLE_LEVEL" });
        }
        // Cấm gán role superadmin cho user khác
        if (Array.isArray(role_ids)) {
            // Lấy danh sách role từ DB để kiểm tra code
            const allRoles = await userRepo.getAllRoles();
            const assignedRoles = allRoles.filter(r => role_ids.includes(r.id));
            if (assignedRoles.some(r => r.code === 'superadmin')) {
                return res.status(403).json({ message: "FORBIDDEN_ASSIGN_SUPERADMIN" });
            }
        }
    }

    // console.log("myRole", myRole?.code, "targetRole", targetRole?.code, "role_ids", role_ids);
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
        await userRepo.updateUser(userId, data);
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
    const currentUser = await userRepo.getUserWithRolesAndPermissions(req.user.id);
    const targetUser = await userRepo.getUserWithRolesAndPermissions(userId);
    if (!targetUser) return res.status(404).json({ message: "USER_NOT_FOUND" });
    const myRole = getHighestRole(currentUser);
    const targetRole = getHighestRole(targetUser);
    // Superadmin có toàn quyền, các role khác bị giới hạn
    if (myRole?.code !== 'superadmin') {
        if (rolePriority(targetRole) >= rolePriority(myRole)) {
            return res.status(403).json({ message: "FORBIDDEN_ROLE_LEVEL" });
        }
    }
    const newPassword = generateRandomPassword(12);
    await userRepo.updateUser(userId, { password: newPassword });
    // Gửi notification cho user
    await sendNotification({
        user_id: targetUser.id,
        type: "user",
        action: "reset_password",
        title: "USER_PASSWORD_RESET",
        message: "USER_PASSWORD_RESET_BY_ADMIN",
        entity_type: "user",
        entity_id: targetUser.id,
        data: { reset_by: req.user.id, username: targetUser.username, password: newPassword },
    });
    // Ghi log mật khẩu mới (sau này sẽ gửi email)
    await logAudit({
        user_id: req.user.id,
        action: "reset_password",
        entity_type: "user",
        entity_id: userId,
        data: { username: targetUser.username, password: newPassword },
        ip_address: req.ip,
        user_agent: req.headers["user-agent"]
    });
    res.json({ newPassword });
};