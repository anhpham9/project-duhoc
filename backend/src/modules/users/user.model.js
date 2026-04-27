import { DataTypes } from "sequelize";
import sequelize from "../../db/index.js";

const User = sequelize.define(
    "User",
    {
        id: {
            type: DataTypes.BIGINT,
            autoIncrement: true,
            primaryKey: true,
        },
        name: DataTypes.STRING,
        username: {
            type: DataTypes.STRING,
            unique: true,
        },
        email: {
            type: DataTypes.STRING,
            unique: true,
        },
        phone: {
            type: DataTypes.STRING,
            unique: true,
        },
        password: DataTypes.TEXT,
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        last_login: DataTypes.DATE,
        created_by: {
            type: DataTypes.BIGINT,
            allowNull: true,
        },
        deleted_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        tableName: "users",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
        paranoid: true, // Bật soft delete
        deletedAt: "deleted_at",
    }
);

export default User;