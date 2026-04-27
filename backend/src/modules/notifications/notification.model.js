import { DataTypes } from "sequelize";
import sequelize from "../../db/index.js";

const Notification = sequelize.define(
    "Notification",
    {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        user_id: { type: DataTypes.BIGINT, allowNull: true },
        role_id: { type: DataTypes.INTEGER, allowNull: true },
        type: { type: DataTypes.STRING, allowNull: false },
        action: { type: DataTypes.STRING, allowNull: false },
        title: { type: DataTypes.STRING, allowNull: false },
        message: { type: DataTypes.TEXT },
        entity_type: { type: DataTypes.STRING, allowNull: false },
        entity_id: { type: DataTypes.BIGINT, allowNull: true },
        data: { type: DataTypes.JSONB },
        is_read: { type: DataTypes.BOOLEAN, defaultValue: false },
        created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    {
        tableName: "notifications",
        timestamps: false,
    }
);

export default Notification;
