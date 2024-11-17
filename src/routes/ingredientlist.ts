import { createIngredientList,  deleteIngredientList,  getAllIngredientLists } from "@/controller/ingredientlist";
import express from "express";


const router = express.Router();
router.post('/createIngredientList',createIngredientList);
router.get('/getAllIngredientLists',getAllIngredientLists);
router.get('/deleteIngredientList',deleteIngredientList);

export default router;