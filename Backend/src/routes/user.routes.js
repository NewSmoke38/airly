import { Router } from "express";
import { 
         registerUser,
         loginUser,
         logoutUser,
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


router.post("/login", loginUser)
router.post("/logout", verifyJWT, logoutUser)

export default router;
