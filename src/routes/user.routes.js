import { Router } from "express";
import { registerUser, loginUser, logoutUser } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { uploadPfp } from "../middlewares/multer.middleware.js";
import { uploadMedia } from "../middlewares/multer.middleware.js";

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

export default router;
