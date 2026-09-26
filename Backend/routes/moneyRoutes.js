import express from "express";
import protectRoute from "../middleware/protectRoute.js";
import {
  markPlayerUnpaid,
  getMyMoney,
  addPayment,
  getPlayerMoney,
  addMoney,
} from "../controllers/moneyController.js";

const router = express.Router();

router.post(
  "/frames/:frameId/unpaid",
  protectRoute(["owner"]),
  markPlayerUnpaid,
);

router.get("/my-money", protectRoute(["player"]), getMyMoney);

router.post("/players/:playerId/pay", protectRoute(["owner"]), addPayment);

router.get("/players/:playerId", protectRoute(["owner"]), getPlayerMoney);

router.post("/players/:playerId/add", protectRoute(["owner"]), addMoney);

export default router;
