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



        const ingredientListWithIds = ingredient_list.map((item: { name: string; portion: number }) => {
            const ingredient = ingredients.find(ingredient => ingredient.name === item.name); // Find ingredient by name
            if (!ingredient) {
                throw new Error(`Ingredient not found: ${item.name}`);
            }
            return {
                ingredientId: ingredient._id, // Use the existing ingredient ID
                portion: item.portion,
                name: item.name
            };
        });

        // Create a new menu with ingredients by name
        const newMenu = new Menu({
            menu_title,
            menu_description,
            ingredient_list: ingredientListWithIds,
            package: menuPackage,
            menu_image,
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
        // Fetch all menus and populate ingredientId fields
        const menus = await Menu.find()
            .populate('ingredient_list.ingredientId', 'name') // Populate only the 'name' field of ingredientId
            .lean(); // Convert documents to plain JavaScript objects

        // Transform the data to match the desired output structure
        const transformedMenus = menus.map(menu => ({
            id: menu.id,
            menu_title: menu.menu_title,
            menu_description: menu.menu_description,
            menu_image: menu.menu_image,
            package: menu.package,
            ingredient_list: menu.ingredient_list.map((item: { ingredientId: { name?: string } | null; portion: number }) => ({
                name: item.ingredientId?.name || 'Unknown', // Handle missing or undefined ingredientId
                portion: item.portion,
            })),
        }));

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

export const updateMenuById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { menu_title, menu_description, ingredient_list, package: menuPackage, menu_image } = req.body;

        // Check if the menu exists
        const existingMenu = await Menu.findById(id);
        if (!existingMenu) {
            res.status(404).json({ message: 'Menu not found' });
            return;
        }

        // Validate and process ingredient_list
        let updatedIngredientList: any = [];
        if (ingredient_list && Array.isArray(ingredient_list)) {
            const ingredientNames = ingredient_list.map((item: { name: string }) => item.name);
            const ingredients = await Ingredient.find({ name: { $in: ingredientNames } });

            // Check if all ingredients exist
            if (ingredients.length !== ingredientNames.length) {
                res.status(400).json({ message: 'Some ingredients are invalid or do not exist' });
                return;
            }

            // Map ingredient_list to include ingredientId and portion
            updatedIngredientList = ingredient_list.map((item: { name: string; portion: number }) => {
                const ingredient = ingredients.find(ingredient => ingredient.name === item.name);
                if (!ingredient) {
                    throw new Error(`Ingredient not found: ${item.name}`);
                }
                return {
                    ingredientId: ingredient._id, // Use the existing ingredient ID
                    portion: item.portion,
                };
            });
        }

        // Update the menu fields
        existingMenu.menu_title = menu_title || existingMenu.menu_title;
        existingMenu.menu_description = menu_description || existingMenu.menu_description;
        existingMenu.ingredient_list = updatedIngredientList.length > 0 ? updatedIngredientList : existingMenu.ingredient_list;
        existingMenu.package = menuPackage || existingMenu.package;
        existingMenu.menu_image = menu_image || existingMenu.menu_image;

        // Save the updated menu
        const updatedMenu = await existingMenu.save();

        res.status(200).json({ message: 'Menu updated successfully', menu: updatedMenu });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};