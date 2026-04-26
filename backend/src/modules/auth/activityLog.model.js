import { DataTypes } from "sequelize";
import sequelize from "../../db/index.js";

const ActivityLog = sequelize.define(
    "ActivityLog",
    {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        user_id: { type: DataTypes.BIGINT, allowNull: true },
        action: {
            type: DataTypes.ENUM(
                "create",
                "update",
                "delete",
                "login",
                "logout",
                "refresh_token",
                "assign",
                "upload",
                "download",
                "approve",
                "reject"
            ), allowNull: false
        },
        object_type: { type: DataTypes.STRING },
        object_id: { type: DataTypes.BIGINT },
        data: { type: DataTypes.JSONB },
        created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    {
        tableName: "activity_logs",
        timestamps: false,
    }
);

export default ActivityLog;
