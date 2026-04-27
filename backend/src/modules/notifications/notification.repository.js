import Notification from "./notification.model.js";

export const getNotificationsForUser = async (userId) => {
    return Notification.findAll({
        where: { user_id: userId },
        order: [["createdAt", "DESC"]],
    });
}

export const getNotificationsForRole = async (roleId) => {
    return Notification.findAll({
        where: { role_id: roleId },
        order: [["createdAt", "DESC"]],
    });
}

export const markNotificationAsRead = async (notificationId) => {
    return Notification.update({ is_read: true }, { where: { id: notificationId } });
}

export const createNotification = async ({ user_id, role_id, type, action, title, message, entity_type, entity_id, data }) => {
    return Notification.create({ user_id, role_id, type, action, title, message, entity_type, entity_id, data });
}

export const deleteNotification = async (notificationId) => {
    return Notification.destroy({ where: { id: notificationId } });
}

export const deleteNotificationsForUser = async (userId) => {
    return Notification.destroy({ where: { user_id: userId } });
}

export const deleteNotificationsForRole = async (roleId) => {
    return Notification.destroy({ where: { role_id: roleId } });
}

export const deleteAllNotifications = async () => {
    return Notification.destroy({ where: {} });
}

export const countUnreadNotificationsForUser = async (userId) => {
    return Notification.count({ where: { user_id: userId, is_read: false } });
}

export const countUnreadNotificationsForRole = async (roleId) => {
    return Notification.count({ where: { role_id: roleId, is_read: false } });
}

export const countUnreadNotifications = async () => {
    return Notification.count({ where: { is_read: false } });
}

export const getUnreadNotificationsForUser = async (userId) => {
    return Notification.findAll({ where: { user_id: userId, is_read: false }, order: [["createdAt", "DESC"]] });
}

export const getUnreadNotificationsForRole = async (roleId) => {
    return Notification.findAll({ where: { role_id: roleId, is_read: false }, order: [["createdAt", "DESC"]] });
}

export const getUnreadNotifications = async () => {
    return Notification.findAll({ where: { is_read: false }, order: [["createdAt", "DESC"]] });
}

export const markAllNotificationsAsRead = async () => {
    return Notification.update({ is_read: true }, { where: {} });
}

export const markAllNotificationsAsReadForUser = async (userId) => {
    return Notification.update({ is_read: true }, { where: { user_id: userId } });
}

export const markAllNotificationsAsReadForRole = async (roleId) => {
    return Notification.update({ is_read: true }, { where: { role_id: roleId } });
}

export const getNotificationById = async (notificationId) => {
    return Notification.findByPk(notificationId);
}

export const updateNotification = async (notificationId, data) => {
    return Notification.update(data, { where: { id: notificationId } });
}

export const deleteNotificationById = async (notificationId) => {
    return Notification.destroy({ where: { id: notificationId } });
}

export const countNotificationsForUser = async (userId) => {
    return Notification.count({ where: { user_id: userId } });
}

export const countNotificationsForRole = async (roleId) => {
    return Notification.count({ where: { role_id: roleId } });
}

export const countAllNotifications = async () => {
    return Notification.count();
}

export const getNotifications = async () => {
    return Notification.findAll({ order: [["createdAt", "DESC"]] });
}

export const getNotificationsByUserId = async (userId) => {
    return Notification.findAll({ where: { user_id: userId }, order: [["createdAt", "DESC"]] });
}

export const getNotificationsByRoleId = async (roleId) => {
    return Notification.findAll({ where: { role_id: roleId }, order: [["createdAt", "DESC"]] });
}