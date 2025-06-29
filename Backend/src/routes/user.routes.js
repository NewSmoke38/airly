import { Router } from "express";
import { 
         registerUser,
         loginUser,
         logoutUser,
         toggleFollow,
         toggleBlock,
         getUserRelationship,
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

// Social features
router.post("/:userId/follow", verifyJWT, toggleFollow)
router.post("/:userId/block", verifyJWT, toggleBlock)
router.get("/:userId/relationship", verifyJWT, getUserRelationship)

export default router;
