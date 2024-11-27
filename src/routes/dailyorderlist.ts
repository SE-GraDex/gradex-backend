import express from "express";
import { getTopThreeOrders, addDailyOrderList, getAllOrders } from "../controller/dailyorderlist";

const router = express.Router();

router.post("/addDailyOrderList", addDailyOrderList);

router.get("/getAllOrders", getAllOrders);

router.get("/getTopThreeOrders", getTopThreeOrders);

export default router;
