import { DataTypes } from "sequelize";
import sequelize from "../../db/index.js";

const RolePermission = sequelize.define(
    "RolePermission",
    {
        role_code: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        permission_code: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
    },
    {
        tableName: "role_permissions",
        timestamps: false,
    }
);

export default RolePermission;