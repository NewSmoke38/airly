import { Router } from "express";
import { getOwnProfile, updateUserSocials, updateUserInfo } from "../controllers/profile.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { uploadPfp } from "../middlewares/multer.middleware.js";

const router = Router();

router.get("/me", verifyJWT, getOwnProfile);
router.patch("/socials", verifyJWT, updateUserSocials);
router.patch("/personal", verifyJWT, uploadPfp.single("pfp"), updateUserInfo);

export default router;