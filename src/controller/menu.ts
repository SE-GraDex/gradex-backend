import { Request, Response } from 'express';
import Menu from '../model/Menu';
import Ingredient from '../model/Ingredient';

// Add a new menu
export const addMenu = async (req: Request, res: Response): Promise<void> => {
    try {
        const { menu_title, menu_description, ingredient_list, package: menuPackage, menu_image } = req.body;

        // Validate required fields
        if (!menu_title || !menu_description || !ingredient_list || !menuPackage || !menu_image) {
            res.status(400).json({ message: 'All fields are required' });
            return;
        }

        // Get ingredients by name from the ingredient_list
        const ingredientNames = ingredient_list.map((item: { name: string }) => item.name);
        const ingredients = await Ingredient.find({ name: { $in: ingredientNames } });

        // Check if all ingredients exist
        if (ingredients.length !== ingredientNames.length) {
            res.status(400).json({ message: 'Some ingredients are invalid or do not exist' });
            return;
        }

        // Map ingredient_list to include ingredientName and portion (not ingredientId)
        const ingredientListWithNames = ingredient_list.map((item: { name: string, portion: number }) => {
            const ingredient = ingredients.find(ingredient => ingredient.name === item.name);
            return {
                ingredientName: ingredient?.name,  // Use the name of the ingredient
                portion: item.portion
            };
        });

        // Create a new menu with ingredients by name
        const newMenu = new Menu({
            menu_title,
            menu_description,
            ingredient_list: ingredientListWithNames,
            package: menuPackage,
            menu_image, // Include menu_image
        });

        await newMenu.save();
        res.status(201).json({ message: 'Menu created successfully', menu: newMenu });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// Delete a menu by ID
export const deleteMenu = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const deletedMenu = await Menu.findByIdAndDelete(id);
        if (!deletedMenu) {
            res.status(404).json({ message: 'Menu not found' });
            return;
        }

        res.status(200).json({ message: 'Menu deleted successfully', menu: deletedMenu });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// Get all menus
export const getAllMenus = async (_req: Request, res: Response): Promise<void> => {
    try {
        const menus = await Menu.find()
            .select('-__v'); // Exclude unnecessary fields like __v

        res.status(200).json(menus);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// Get a menu by ID
export const getMenuById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const menu = await Menu.findById(id)
            .select('-__v'); // Exclude unnecessary fields like __v
        if (!menu) {
            res.status(404).json({ message: 'Menu not found' });
            return;
        }

        res.status(200).json(menu);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
