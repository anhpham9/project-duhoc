import { DataTypes } from "sequelize";
import sequelize from "../../db/index.js";

const Permission = sequelize.define(
    "Permission",
    {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        code: { type: DataTypes.STRING, unique: true },
        description: DataTypes.TEXT,
    },
    {
        tableName: "permissions",
        timestamps: false,
    }
);

export default Permission;