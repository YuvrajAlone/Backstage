import express from "express";
import {
  registerPlayer,
  login,
  logout,
  getCurrentUser,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerPlayer);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", getCurrentUser);

export default router;
