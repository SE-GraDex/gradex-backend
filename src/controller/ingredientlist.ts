import Ingredient from '@/model/Ingredient';
import Ingredient_list from '@/model/Ingredient_list';
import { Request, Response } from 'express';
import { ObjectId } from 'mongoose';

interface IIngredientList {
    ingredientId: ObjectId,
    portion: number
}

// Get all ingredient lists
export const getAllIngredientLists = async (req: Request, res: Response): Promise<void> => {
    try {
        // const ingredientLists = await Ingredient_list.find()
        res.status(200).json({ message : 'Bro'});
    } catch (error) {
        res.status(500).json({ message: 'Error fetching ingredient lists', error });
    }
};

// Get a specific ingredient list by ID
export const getIngredientListById = async (req: Request, res: Response): Promise<void> => {
    try {
        const ingredientList = await Ingredient_list.findById(req.params.id).populate({
            path: 'ingredient',
            select: ['name','unit']
        });
        if (!ingredientList){
            res.status(404).json({ message: 'Ingredient list not found' });
            return;
        }  
        res.status(200).json(ingredientList);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching ingredient list', error });
    }
};

// Create a new ingredient list
export const createIngredientList = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, portion } = req.body;
        const savedIngredientLists = [];

        for (let i = 0; i < portion.length; i++) {
            const ingredientData = await Ingredient.findOne({ name: name[i] });
            if (!ingredientData) {
                res.status(404).json({ message: `Ingredient ${name[i]} not found` });
                return;
            }

            const newIngredient = new Ingredient_list({
                ingredientId: ingredientData._id,  // Use the `_id` field directly
                portion: portion[i]
            } as IIngredientList);

            const savedIngredientList = await newIngredient.save();
            savedIngredientLists.push(savedIngredientList);
        }
        res.status(201).json(savedIngredientLists);
    } catch (error) {
        res.status(500).json({ message: 'Error creating ingredient list', error });
    }
};

// Update an ingredient list by ID
export const updateIngredientList = async (req: Request, res: Response): Promise<void> => {
    try {
        const updatedIngredientList = await Ingredient_list.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        ).populate('ingredientId');
        if (!updatedIngredientList){
            res.status(404).json({ message: 'Ingredient list not found' });
            return;
        }  
        res.status(200).json(updatedIngredientList);
    } catch (error) {
        res.status(500).json({ message: 'Error updating ingredient list', error });
    }
};

// Delete an ingredient list by ID
export const deleteIngredientList = async (req: Request, res: Response): Promise<void> => {
    try {
        const deletedIngredientList = await Ingredient_list.findByIdAndDelete(req.params.id);
        if (!deletedIngredientList) {
            res.status(404).json({ message: 'Ingredient list not found' });
            return; 
        }
        res.status(200).json({ message: 'Ingredient list deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting ingredient list', error });
    }
};