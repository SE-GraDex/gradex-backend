import express from "express";
import {
  addMenu,
  deleteMenu,
  getAllMenus,
  getMenuById,
  updateMenuById,
  getMenuByName
} from "../controller/menu";
import upload from "../middleware/upload";

const router = express.Router();

router.post("/createMenu", upload.single("menu_image"), addMenu);
router.delete("/deleteMenu/:id", deleteMenu);
router.get("/getMenus", getAllMenus);
router.get("/getMenuById/:id", getMenuById);
router.get('/getMenuByName/:name', getMenuByName);
router.put("/updateMenu/:id", upload.single("menu_image"), updateMenuById);

export default router;
