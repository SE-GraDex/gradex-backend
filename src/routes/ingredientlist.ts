import { createIngredientList,  getAllIngredientLists } from "@/controller/ingredientlist";
import express from "express";


const router = express.Router();
router.post('/createIngredientList',createIngredientList);
router.get('/getAllIngredientLists',getAllIngredientLists);

export default router;