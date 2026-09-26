import express from "express";
import protectRoute from "../middleware/protectRoute.js";
import { getPlayers } from "../controllers/userController.js";

const router = express.Router();

router.get("/players", protectRoute(["owner"]), getPlayers);

export default router;
