import { Router } from "express";
import { getFeedPosts } from "../controllers/feed.controller.js";

const router = Router();

router.get("/", getFeedPosts);

export default router;