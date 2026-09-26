import express from "express";
import protectRoute from "../middleware/protectRoute.js";
import { createFrame, getFrames } from "../controllers/frameController.js";

const router = express.Router();

router.post("/", protectRoute(["owner"]), createFrame);
router.get("/", protectRoute(["owner"]), getFrames);

export default router;
