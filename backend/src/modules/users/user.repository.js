import { Op } from "sequelize";
import User from "./user.model.js";
import Role from "../roles/role.model.js";
import Permission from "../permissions/permission.model.js";
import UserRole from "../userRoles/userRole.model.js";
import sequelize from "../../db/index.js";

// Tìm kiếm, lọc, sắp xếp user
export const searchUsersWithFilters = async ({ search = "", role, active, sort_by = "id", sort_dir = "asc", page = 1, page_size = 20 }) => {
    const where = {};
    if (search) {
        where[Op.or] = [
            { username: { [Op.iLike]: `%${search}%` } },
            { name: { [Op.iLike]: `%${search}%` } },
            { email: { [Op.iLike]: `%${search}%` } },
            { phone: { [Op.iLike]: `%${search}%` } }
        ];
    }
    if (active === "true" || active === true) where.is_active = true;
    if (active === "false" || active === false) where.is_active = false;


    // include role filter + join created_by (self join)
    const include = [
        {
            model: Role,
            attributes: ["id", "code", "description"],
            through: { attributes: [] },
        },
        {
            model: User,
            as: "creator",
            attributes: ["id", "name"],
            required: false,
        }
    ];
    if (role && role !== "all") {
        include[0].where = { id: role };
    }

    // sort
    let order = [["id", "ASC"]];
    const validSort = ["id", "username", "email", "name", "phone", "is_active"];
    if (validSort.includes(sort_by)) {
        order = [[sort_by, sort_dir.toLowerCase() === "desc" ? "DESC" : "ASC"]];
    } else if (sort_by === "role_code") {
        // Sắp xếp theo code của role đầu tiên (nếu có)
        order = [[{ model: Role }, "code", sort_dir.toLowerCase() === "desc" ? "DESC" : "ASC"]];
    }

    // Không phân trang ở repo, luôn trả về toàn bộ danh sách đã filter
    const users = await User.findAll({ where, include, order });

    // thêm trường created_by_name vào kết quả trả về, lấy từ quan hệ self join
    const usersWithCreator = users.map(u => {
        const userObj = u.toJSON();
        userObj.created_by_name = userObj.creator ? userObj.creator.name : null;
        delete userObj.creator;
        return userObj;
    });

    return { users: usersWithCreator };
};

export const findUserByUsername = async (username) => {
    return User.findOne({ where: { username } });
}

export const findUserByEmail = async (email) => {
    return User.findOne({ where: { email } });
}

export const getAllRoles = async () => {
    return Role.findAll();
};

export const getAllUsers = async () => {
    return User.findAll();
};

export const getAllUsersWithRoles = async () => {
    return User.findAll({
        include: {
            model: Role,
            attributes: ["id", "code", "description"],
            through: { attributes: [] },
        },
    });
};

export const getUserById = async (id) => {
    return User.findByPk(id);
};

export const getUserByUsername = async (username) => {
    return User.findOne({ where: { username } });
};

export const createUser = async (data) => {
    return User.create(data);
};

export const updateUser = async (id, data) => {
    return User.update(data, { where: { id } });
};

export const deleteUserById = async (id) => {
    return User.destroy({ where: { id } });
};

export const getUserWithRolesAndPermissions = async (userId) => {
    return User.findByPk(userId, {
        include: {
            model: Role,
            include: {
                model: Permission,
                attributes: ["code"],
                through: { attributes: [] },
            },
            attributes: ["id", "code", "description"],
            through: { attributes: [] },
        },
    });
};

export const deleteUserRolesByUserId = async (userId) => {
    return UserRole.destroy({ where: { user_id: userId } });
};


/**
 * Gán nhiều role cho user
 * - Xóa hết role cũ, gán các role mới
 * - Dùng transaction để đảm bảo an toàn
 */
export const assignRolesToUser = async (userId, roleIds) => {
    return sequelize.transaction(async (t) => {
        await UserRole.destroy({ where: { user_id: userId }, transaction: t });
        if (Array.isArray(roleIds) && roleIds.length > 0) {
            await UserRole.bulkCreate(roleIds.map(role_id => ({ user_id: userId, role_id })), { transaction: t });
        }
    });
};
