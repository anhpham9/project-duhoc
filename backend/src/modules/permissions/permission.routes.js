// định nghĩa các route liên quan đến permissions, sử dụng controller để xử lý logic nghiệp vụ, áp dụng middleware để bảo vệ route
import express from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { superadminMiddleware } from "../../middlewares/superadmin.middleware.js";
import {
  getAllPermissions,
  createPermission,
  deletePermission,
  getRolePermissions,
  setRolePermissions
} from "./permission.controller.js";

const router = express.Router();

router.get("/", authMiddleware, superadminMiddleware, getAllPermissions);
router.post("/", authMiddleware, superadminMiddleware, createPermission);
router.delete("/:id", authMiddleware, superadminMiddleware, deletePermission);
router.get("/role/:roleId", authMiddleware, superadminMiddleware, getRolePermissions);
router.post("/role/:roleId", authMiddleware, superadminMiddleware, setRolePermissions);

export default router;
