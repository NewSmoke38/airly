import { Router } from "express";
import { getAllUsers, updateUserById, deleteUserById, getAnalytics, getUserStats, getContentStats } from "../controllers/admin.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/isAdmin.middlware.js";

const router = Router();

router.get("/users", verifyJWT, isAdmin, getAllUsers);
router.patch("/users/:id", verifyJWT, isAdmin, updateUserById);
router.delete("/users/:id", verifyJWT, isAdmin, deleteUserById);

router.get("/analytics", verifyJWT, isAdmin, getAnalytics);
router.get("/analytics/users", verifyJWT, isAdmin, getUserStats);
router.get("/analytics/content", verifyJWT, isAdmin, getContentStats);

export default router;