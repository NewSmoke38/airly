import { Router } from "express";
import { getAllUsers, updateUserById, deleteUserById } from "../controllers/admin.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/isAdmin.middlware.js";

const router = Router();

router.get("/users", verifyJWT, isAdmin, getAllUsers);
router.patch("/users/:id", verifyJWT, isAdmin, updateUserById);
router.delete("/users/:id", verifyJWT, isAdmin, deleteUserById);

export default router;