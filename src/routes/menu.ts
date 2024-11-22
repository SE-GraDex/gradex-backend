import express from "express";
import {
  addMenu,
  deleteMenu,
  getAllMenus,
  getMenuById,
  updateMenuById,
} from "../controller/menu";

const router = express.Router();

router.post("/createMenu", addMenu);
router.delete("/deleteMenu/:id", deleteMenu);
router.get("/getMenus", getAllMenus);
router.get("/getMenuById/:id", getMenuById);
router.put("/updateMenu/:id", updateMenuById);

export default router;
