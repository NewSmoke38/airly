import { Router } from "express";
import { getOwnProfile, updateUserSocials, updateUserInfo, getUserByUsername, getPostsByUsername } from "../controllers/profile.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { uploadPfp } from "../middlewares/multer.middleware.js";

const router = Router();
// for oneself
router.get("/me", verifyJWT, getOwnProfile);
router.patch("/socials", verifyJWT, updateUserSocials);
router.patch("/personal", verifyJWT, uploadPfp.single("pfp"), updateUserInfo);
// for other users
// Public profile routes (no auth required)
router.get("/u/:username", getUserByUsername);
router.get("/u/:username/posts", getPostsByUsername);

export default router;