import { Router } from "express";
import { getFeedPosts } from "../controllers/feed.controller.js";
import { optionalAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", optionalAuth, getFeedPosts);

export default router;