import { Router } from "express";
import {
    registerUser,
    loginUser,
    logoutUser,
    toggleFollow,
    toggleBlock,
    getUserRelationship,
    updateUserProfile,
} from "../controllers/user.controller.js";

import { uploadPfp } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router()

router.route("/register").post(
    uploadPfp.fields([
        {
            name: "pfp",
            maxCount: 1
        },
    ]),
    registerUser)


router.route("/login").post(loginUser)
router.route("/logout").post(verifyJWT, logoutUser)

router.post("/:userId/follow", verifyJWT, toggleFollow)
router.post("/:userId/block", verifyJWT, toggleBlock)
router.get("/:userId/relationship", verifyJWT, getUserRelationship)

router.route("/update-profile").patch(verifyJWT, uploadPfp.single("pfp"), updateUserProfile);

export default router;
