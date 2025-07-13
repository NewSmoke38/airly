import { Router } from "express";
import { testBackend } from "../controllers/test.controller.js";

const router = Router();

// Test route for backend health check
router.route("/").get(testBackend);

export default router; 