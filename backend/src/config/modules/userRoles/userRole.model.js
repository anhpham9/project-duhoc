import { DataTypes } from "sequelize";
import sequelize from "../../db/index.js";

const UserRole = sequelize.define(
    "UserRole",
    {
        user_id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
        },
        role_code: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
    },
    {
        tableName: "user_roles",
        timestamps: false,
    }
);

export default UserRole;