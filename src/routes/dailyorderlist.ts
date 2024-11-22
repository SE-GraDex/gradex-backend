import express from "express";
import { addDailyOrderList, getAllOrders } from "../controller/dailyorderlist";

const router = express.Router();

router.post("/addDailyOrderList", addDailyOrderList);

router.get("/getAllOrders", getAllOrders);

export default router;
