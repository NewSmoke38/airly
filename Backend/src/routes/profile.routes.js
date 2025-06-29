import { Router } from "express";
import { getOwnProfile, updateUserSocials, updateUserInfo, getUserByUsername, getPostsByUsername } from "../controllers/profile.controller.js";
import { verifyJWT, optionalAuth } from "../middlewares/auth.middleware.js";
import { uploadPfp } from "../middlewares/multer.middleware.js";

const router = Router();
// for oneself
router.get("/me", verifyJWT, getOwnProfile);
router.patch("/socials", verifyJWT, updateUserSocials);
router.patch("/personal", verifyJWT, uploadPfp.single("pfp"), updateUserInfo);
// for other users
// Profile routes with optional auth
router.get("/u/:username", optionalAuth, getUserByUsername);
router.get("/u/:username/posts", optionalAuth, getPostsByUsername);

export default router;