import { DataTypes } from "sequelize";
import sequelize from "../../db/index.js";

const Role = sequelize.define(
    "Role",
    {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        code: { type: DataTypes.STRING, unique: true },
        description: DataTypes.TEXT,
    },
    {
        tableName: "roles",
        timestamps: false,
    }
);

export default Role;