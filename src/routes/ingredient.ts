import { createIngredient, deleteIngredient, getIngredientById, getIngredients, updateIngredient } from "@/controller/ingredient";
import express from "express";


const router = express.Router();

router.post('/createIngredient', createIngredient);
router.get('/getIngredients', getIngredients);
router.get('/getIngredientById/:id', getIngredientById);
router.put('/updateIngredient/:id', updateIngredient);
router.delete('/deleteIngredient/:id', deleteIngredient);

export default router;