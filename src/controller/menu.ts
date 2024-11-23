import { Request, Response } from "express";
import Menu from "../model/Menu";
import Ingredient from "../model/Ingredient";

// Add a new menu
export const addMenu = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      menu_title,
      menu_description,
      package: menuPackage,
      // menu_image,
    } = req.body;

    if (!req.file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }

    let menu_image: any;
    console.log(req.body);

    // console.log(req.body + " file " + req.file);

    let ingredient_list;

    // Parse ingredient_list if it's a string
    if (typeof req.body.ingredient_list === "string") {
      try {
        ingredient_list = JSON.parse(req.body.ingredient_list);
      } catch (error) {
        res.status(400).json({
          message: "Invalid ingredient_list format. Must be valid JSON.",
        });
        return;
      }
    } else {
      ingredient_list = req.body.ingredient_list;
    }

    // Validate ingredient_list is an array
    if (!Array.isArray(ingredient_list)) {
      res.status(400).json({ message: "ingredient_list must be an array" });
      return;
    }

    // Validate other fields
    if (!menu_title || !menu_description || !menuPackage) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    // Fetch ingredients from database
    const ingredientNames = ingredient_list.map(
      (item: { name: string }) => item.name,
    );
    const ingredients = await Ingredient.find({
      name: { $in: ingredientNames },
    });

    if (ingredients.length !== ingredientNames.length) {
      res
        .status(400)
        .json({ message: "Some ingredients are invalid or do not exist" });
      return;
    }

    // Create ingredient list with IDs
    const ingredientListWithIds = ingredient_list.map(
      (item: { name: string; portion: number }) => {
        const ingredient = ingredients.find(
          (ingredient) => ingredient.name === item.name,
        );
        if (!ingredient) {
          throw new Error(`Ingredient not found: ${item.name}`);
        }
        return {
          ingredientId: ingredient._id,
          portion: item.portion,
          name: item.name,
        };
      },
    );

    const fileBuffer = req.file.buffer;
    menu_image = `data:${req.file.mimetype};base64,${fileBuffer.toString("base64")}`;

    // Save menu
    const newMenu = new Menu({
      menu_title,
      menu_description,
      ingredient_list: ingredientListWithIds,
      package: menuPackage,
      menu_image,
    });

    console.log(newMenu);
    await newMenu.save();
    res
      .status(201)
      .json({ message: "Menu created successfully", menu: newMenu });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a menu by ID
export const deleteMenu = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    const deletedMenu = await Menu.findByIdAndDelete(id);
    if (!deletedMenu) {
      res.status(404).json({ message: "Menu not found" });
      return;
    }

    res
      .status(200)
      .json({ message: "Menu deleted successfully", menu: deletedMenu });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Get all menus
export const getAllMenus = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  try {
    // Fetch all menus and populate ingredientId fields
    const menus = await Menu.find()
      .populate("ingredient_list.ingredientId", "name") // Populate only the 'name' field of ingredientId
      .lean(); // Convert documents to plain JavaScript objects

    // Transform the data to match the desired output structure
    const transformedMenus = menus.map((menu) => ({
      id: menu.id,
      menu_title: menu.menu_title,
      menu_description: menu.menu_description,
      menu_image: menu.menu_image,
      package: menu.package,
      ingredient_list: menu.ingredient_list.map(
        (item: {
          ingredientId: { name?: string } | null;
          portion: number;
        }) => ({
          name: item.ingredientId?.name || "Unknown", // Handle missing or undefined ingredientId
          portion: item.portion,
        }),
      ),
    }));

    res.status(200).json(menus);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Get a menu by ID
export const getMenuById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    const menu = await Menu.findById(id).select("-__v"); // Exclude unnecessary fields like __v
    if (!menu) {
      res.status(404).json({ message: "Menu not found" });
      return;
    }

    res.status(200).json(menu);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateMenuById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      menu_title,
      menu_description,
      ingredient_list,
      package: menuPackage,
    } = req.body;

    // Check if the menu exists
    const existingMenu = await Menu.findById(id);
    if (!existingMenu) {
      res.status(404).json({ message: "Menu not found" });
      return;
    }

    // Process image: Either Base64 from body or convert from file
    let menu_image = req.body.menu_image; // Check if Base64 string is provided
    if (!menu_image && req.file) {
      // Convert uploaded file to Base64
      menu_image = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
    }

    // Validate and process ingredient_list
    let updatedIngredientList: any = [];
    if (ingredient_list && Array.isArray(ingredient_list)) {
      const ingredientNames = ingredient_list.map(
        (item: { name: string }) => item.name,
      );
      const ingredients = await Ingredient.find({
        name: { $in: ingredientNames },
      });

      // Check if all ingredients exist
      if (ingredients.length !== ingredientNames.length) {
        res
          .status(400)
          .json({ message: "Some ingredients are invalid or do not exist" });
        return;
      }

      // Map ingredients to include IDs
      updatedIngredientList = ingredient_list.map(
        (item: { name: string; portion: number }) => {
          const ingredient = ingredients.find(
            (ingredient) => ingredient.name === item.name,
          );
          if (!ingredient) {
            throw new Error(`Ingredient not found: ${item.name}`);
          }
          return {
            ingredientId: ingredient._id,
            portion: item.portion,
          };
        },
      );
    }

    // Update the menu fields
    existingMenu.menu_title = menu_title || existingMenu.menu_title;
    existingMenu.menu_description =
      menu_description || existingMenu.menu_description;
    existingMenu.ingredient_list =
      updatedIngredientList.length > 0
        ? updatedIngredientList
        : existingMenu.ingredient_list;
    existingMenu.package = menuPackage || existingMenu.package;
    existingMenu.menu_image = menu_image || existingMenu.menu_image;

    // Save the updated menu
    const updatedMenu = await existingMenu.save();

    res
      .status(200)
      .json({ message: "Menu updated successfully", menu: updatedMenu });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
