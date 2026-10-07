import express from "express";
import protectRoute from "../middleware/protectRoute.js";
import {
  createFrame,
  getFrames,
  getFrame,
  completeFrame,
} from "../controllers/frameController.js";

const router = express.Router();

router.post("/", protectRoute(["owner"]), createFrame);
router.get("/", protectRoute(["owner"]), getFrames);
router.get("/:frameId", protectRoute(["owner"]), getFrame);
router.patch("/:frameId/complete", protectRoute(["owner"]), completeFrame);

export default router;
