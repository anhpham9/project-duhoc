import { DataTypes } from "sequelize";
import sequelize from "../../db/index.js";

const AuditLog = sequelize.define(
    "AuditLog",
    {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        user_id: { type: DataTypes.BIGINT, allowNull: true },
        action: { type: DataTypes.STRING, allowNull: false },
        entity_type: { type: DataTypes.STRING },
        entity_id: { type: DataTypes.BIGINT },
        data: { type: DataTypes.JSONB },
        ip_address: { type: DataTypes.STRING },
        user_agent: { type: DataTypes.TEXT },
        created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    {
        tableName: "audit_logs",
        timestamps: false,
    }
);

export default AuditLog;
