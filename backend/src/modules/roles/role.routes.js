import express from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { superadminMiddleware } from "../../middlewares/superadmin.middleware.js";
import {
    getAllRoles,
    getRoleById,
    createRole,
    updateRole,
    deleteRole
} from "./role.controller.js";

const router = express.Router();

router.get("/", authMiddleware, getAllRoles);
router.get("/:id", authMiddleware, getRoleById);
router.post("/", authMiddleware, superadminMiddleware, createRole);
router.put("/:id", authMiddleware, superadminMiddleware, updateRole);
router.delete("/:id", authMiddleware, superadminMiddleware, deleteRole);

export default router;
