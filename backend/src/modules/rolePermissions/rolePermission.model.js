import { DataTypes } from "sequelize";
import sequelize from "../../db/index.js";

const RolePermission = sequelize.define(
    "RolePermission",
    {
        role_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
        },
        permission_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
        },
    },
    {
        tableName: "role_permissions",
        timestamps: false,
    }
);

export default RolePermission;