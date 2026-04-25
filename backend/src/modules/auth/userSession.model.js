import { DataTypes } from "sequelize";
import sequelize from "../../db/index.js";

const UserSession = sequelize.define(
  "UserSession",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    refresh_token_hash: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    ip_address: DataTypes.STRING,
    user_agent: DataTypes.TEXT,
    expired_at: DataTypes.DATE,
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "user_sessions",
    timestamps: false,
  }
);

export default UserSession;
