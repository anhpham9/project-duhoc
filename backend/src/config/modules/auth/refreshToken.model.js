import { DataTypes } from "sequelize";
import sequelize from "../../db/index.js";

const RefreshToken = sequelize.define(
    "RefreshToken",
    {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        user_id: DataTypes.BIGINT,
        token_hash: DataTypes.TEXT,
        is_revoked: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        expires_at: DataTypes.DATE,
    },
    {
        tableName: "refresh_tokens",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: false,
    }
);

export default RefreshToken;