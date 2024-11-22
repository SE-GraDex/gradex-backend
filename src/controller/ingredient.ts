import Ingredient from '@/model/Ingredient';
import { Request, Response } from 'express';
import { ObjectId } from 'mongoose';

interface  IIngredient {
    name: string,
    priceperUnit: number,
    unit: string
}

// Create a new ingredient
export const createIngredient = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name,priceperUnit, unit } = req.body as IIngredient;
        
        // Check if the ingredient already exists
        const existingIngredient = await Ingredient.findOne({ name });
        if (existingIngredient) {
            res.status(400).json({ message: 'Ingredient already exists' });
            return;
        }

        const newIngredient = new Ingredient({ name,priceperUnit, unit } as IIngredient);
        await newIngredient.save();
        
        res.status(201).json({
            message: 'Ingredient created successfully',
            ingredient: newIngredient
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all ingredients
export const getIngredients = async (req: Request, res: Response): Promise<void> => {
    try {
        const ingredients = await Ingredient.find();
        res.status(200).json(ingredients);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get a single ingredient by ID
export const getIngredientById = async (req: Request, res: Response): Promise<void> => {
    try {
        const ingredient = await Ingredient.findById(req.params.id);
        
        if (!ingredient) {
            res.status(404).json({ message: 'Ingredient not found' });
            return;
        }

        res.status(200).json(ingredient);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update an ingredient by ID
export const updateIngredient = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name,priceperUnit, unit } = req.body as IIngredient;
        const ingredient = await Ingredient.findByIdAndUpdate(
            req.params.id,
            { name,priceperUnit, unit },
            { new: true } // Return the updated document
        );
        
        if (!ingredient) {
            res.status(404).json({ message: 'Ingredient not found' });
            return;
        }

        res.status(200).json({
            message: 'Ingredient updated successfully',
            ingredient
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete an ingredient by ID
export const deleteIngredient = async (req: Request, res: Response): Promise<void> => {
    try {
        const ingredient = await Ingredient.findByIdAndDelete(req.params.id);
        
        if (!ingredient) {
            res.status(404).json({ message: 'Ingredient not found' });
            return;
        }

        res.status(200).json({
            message: 'Ingredient deleted successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
