import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { registerUser, loginUser, logoutUser } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router()
 
router.route("/register").post(
    upload.fields([                
        {
            name: "pfp",
            maxCount: 1
        },
    ]),
    registerUser)  

router.route("/login").post(loginUser)
router.route("/logout").post(verifyJWT, logoutUser)

export default router;
