import bcrypt from "bcrypt";
import express from "express";
import * as userRepo from "./user.repository.js";
import { validateProfile, trimStringFields, validatePassword } from "./user.validation.js";
import { logActivity } from "../../utils/activityLogger.js";
import { findLogsByUser } from "./activityLog.repository.js";
import { hashPassword } from "../../utils/hash.js";

// Lấy thông tin profile user hiện tại
export const getProfile = async (req, res) => {

    // console.log("User ID from token:", req.user); // Debug log

    let user = await userRepo.getUserById(req.user.id);
    if (!user) return res.status(404).json({ error: "USER_NOT_FOUND" });
    // Remove password before sending
    const { password, ...userSafe } = user.dataValues || user;
    res.json({ user: userSafe });
};

// Cập nhật profile user hiện tại
export const updateProfile = async (req, res) => {
    const data = trimStringFields({ ...req.body });
    // Không cho update các trường nhạy cảm
    delete data.id;
    delete data.username;
    delete data.created_by;
    delete data.deleted_at;
    delete data.created_at;
    delete data.updated_at;
    delete data.Roles;

    // Validate
    const errors = validateProfile(data);
    if (Object.keys(errors).length > 0) {
        return res.status(400).json({ errors: { ...errors } });
    }

    // check duplicate email/phone/zalo/fb nếu có thay đổi
    const existingUserByEmail = await userRepo.findUserByEmail(data.email);
    if (existingUserByEmail && String(existingUserByEmail.id) !== String(req.user.id)) {
        return res.status(409).json({ errors: { email: "EMAIL_EXISTS" } });
    }
    if (data.phone) {
        const existing = await userRepo.findUserByPhone(data.phone);
        if (existing && String(existing.id) !== String(req.user.id)) {
            return res.status(409).json({ errors: { phone: "PHONE_EXISTS" } });
        }
    }
    if (data.zalo) {
        const existing = await userRepo.findUserByZalo(data.zalo);
        if (existing && String(existing.id) !== String(req.user.id)) {
            return res.status(409).json({ errors: { zalo: "ZALO_EXISTS" } });
        }
    }
    if (data.fb) {
        const existing = await userRepo.findUserByFb(data.fb);
        if (existing && String(existing.id) !== String(req.user.id)) {
            return res.status(409).json({ errors: { fb: "FB_EXISTS" } });
        }
    }

    try {
        await userRepo.updateUser(req.user.id, data);
    } catch (err) {
        return res.status(500).json({ error: "USER_UPDATE_FAILED" });
    }

    let user = await userRepo.getUserById(req.user.id);
    const { password, ...userSafe } = user.dataValues || user;

    // Ghi vào activity_logs
    await logActivity({
        user_id: req.user.id,
        action: "update",
        entity_type: "user",
        entity_id: user.id,
        data: { after: userSafe },
    });

    res.json({ user: userSafe });
};

// Đổi mật khẩu user hiện tại
export const changeProfilePassword = async (req, res) => {
    const { currentPassword, password, passwordRepeat } = req.body;
    // Validate password
    if (!currentPassword) {
        return res.status(400).json({ errors: { currentPassword: 'PASSWORD_REQUIRED' } });
    }
    const passwordError = validatePassword(password);
    if (passwordError) {
        return res.status(400).json({ errors: { password: passwordError } });
    }
    if (!passwordRepeat) {
        return res.status(400).json({ errors: { passwordRepeat: 'PASSWORD_REQUIRED' } });
    }
    if (password !== passwordRepeat) {
        return res.status(400).json({ errors: { passwordRepeat: 'PASSWORD_REPEAT_MISMATCH' } });
    }
    // Lấy user hiện tại
    const user = await userRepo.getUserById(req.user.id);
    if (!user) return res.status(404).json({ error: "USER_NOT_FOUND" });
    // So sánh mật khẩu hiện tại
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
        return res.status(400).json({ errors: { currentPassword: 'WRONG_PASSWORD' } });
    }
    // Hash mật khẩu mới
    const hash = await hashPassword(password);

    await userRepo.updateUser(req.user.id, { password: hash });

    // Ghi vào activity_logs
    await logActivity({
        user_id: req.user.id,
        action: "change_password",
        entity_type: "user",
        entity_id: user.id,
        data: { message: "USER_CHANGE_PASSWORD_VIA_PROFILE" },
    });

    res.json({ success: true });
};

// Lấy activity logs của user hiện tại
export const getActivityLogs = async (req, res) => {
    try {
        const logs = await findLogsByUser(req.user.id, { limit: 50 });
        res.json({ logs });
    } catch (err) {
        res.status(500).json({ error: "GET_ACTIVITY_LOGS_FAILED" });
    }
};
