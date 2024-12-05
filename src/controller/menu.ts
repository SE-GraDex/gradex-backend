import { Request, Response } from "express";
import Menu from "../model/Menu";
import Ingredient from "../model/Ingredient";
import sharp from 'sharp';

// Utility function to compress image before Base64 encoding
const compressImageToBase64 = async (imageBuffer: Buffer): Promise<string> => {
  const compressedBuffer = await sharp(imageBuffer)
    .resize(360,360) // Resize to 800px width
    .jpeg({ quality: 80 }) // Compress JPEG to 80% quality
    .toBuffer();

  // Convert the compressed buffer to Base64
  return compressedBuffer.toString('base64');
};

// Add a new menu
export const addMenu = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      menu_title,
      menu_description,
      package: menuPackage,
      // menu_image,
    } = req.body;

    let menu_image: any;
    if (!req.file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }
    else{
      const fileBuffer = req.file.buffer;

    // Compress the image and encode it to Base64
    const base64Data = await compressImageToBase64(fileBuffer);

    // Construct the full Base64 image string
    menu_image = `data:${req.file.mimetype};base64,${base64Data}`;
    }

   
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
      (item: { name: string; portion: number; }) => {
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

    // const fileBuffer = req.file.buffer;
    // menu_image = `data:${req.file.mimetype};base64,${fileBuffer.toString("base64")}`;

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
// Get all menus
export const getAllMenus = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  try {
    // Fetch all menus and populate ingredientId fields
    const menus = await Menu.find()
      .populate("ingredient_list.ingredientId", "name unit pricePerUnit") // Populate 'name', 'unit', and 'pricePerUnit' fields
      .lean(); // Convert documents to plain JavaScript objects

    // Transform the data to match the desired output structure
    const transformedMenus = await Promise.all(
      menus.map(async (menu) => {
        const ingredientList = await Promise.all(
          menu.ingredient_list.map(async (item: any) => {
            // Fetch ingredient details based on ingredientId
            const ingredient = await Ingredient.findById(item.ingredientId).select("name unit priceperunit");
            return {
              name: ingredient?.name || "Unknown", // Handle missing or undefined ingredient
              portion: item.portion,
              unit: ingredient?.unit || "N/A", // Include the unit field
              priceperunit: ingredient?.priceperunit || 0, // Include pricePerUnit, default to 0 if missingz
            };
          }),
        );

        return {
          menu_title: menu.menu_title,
          menu_description: menu.menu_description,
          package: menu.package,
          ingredient_list: ingredientList,
          menu_image: menu.menu_image, // Use the processed ingredient list
        };
      }),
    );

    res.status(200).json(transformedMenus);
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

    // Fetch the menu by ID and populate ingredient details
    const menu = await Menu.findById(id)
      .populate("ingredient_list.ingredientId", "name unit pricePerUnit") // Populate 'name', 'unit', and 'pricePerUnit'
      .select("-__v") // Exclude the '__v' field
      .lean(); // Convert the document to a plain JavaScript object

    if (!menu) {
      res.status(404).json({ message: "Menu not found" });
      return;
    }

    // Transform ingredient list to include enriched details
    const transformedIngredientList = menu.ingredient_list.map(
      (item: {
        ingredientId: { name?: string; unit?: string; pricePerUnit?: number } | null;
        portion: number;
      }) => ({
        name: item.ingredientId?.name || "Unknown",
        portion: item.portion,
        unit: item.ingredientId?.unit || "N/A",
        pricePerUnit: item.ingredientId?.pricePerUnit || 0,
      }),
    );

    // Prepare the final transformed response
    const transformedMenu = {
      menu_title: menu.menu_title,
      menu_description: menu.menu_description,
      package: menu.package,
      ingredient_list: transformedIngredientList,
      menu_image: menu.menu_image,
    };

    res.status(200).json(transformedMenu);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Get a menu by name
export const getMenuByName = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { name } = req.params;

    // Fetch the menu by its title and populate ingredient details
    const menu = await Menu.findOne({ menu_title: name })
      .populate("ingredient_list.ingredientId", "name unit pricePerUnit") // Populate 'name', 'unit', and 'pricePerUnit'
      .select("-__v") // Exclude the '__v' field
      .lean(); // Convert the document to a plain JavaScript object

    if (!menu) {
      res.status(404).json({ message: "Menu not found" });
      return;
    }

    // Transform ingredient list to include enriched details
    const transformedIngredientList = menu.ingredient_list.map(
      (item: {
        ingredientId: { name?: string; unit?: string; pricePerUnit?: number } | null;
        portion: number;
      }) => ({
        name: item.ingredientId?.name || "Unknown",
        portion: item.portion,
        unit: item.ingredientId?.unit || "N/A",
        pricePerUnit: item.ingredientId?.pricePerUnit || 0,
      }),
    );

    // Prepare the final transformed response
    const transformedMenu = {
      menu_title: menu.menu_title,
      menu_description: menu.menu_description,
      package: menu.package,
      ingredient_list: transformedIngredientList,
      menu_image: menu.menu_image,
    };

    res.status(200).json(transformedMenu);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};



export const updateMenuById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const oldname:string = req.params.menu_title;
    const {
      menu_title,
      menu_description,
      ingredient_list,
      package: menuPackage,
    } = req.body;
    console.log(oldname,req.body);
    // Check if the menu exists
    const existingMenu = await Menu.findOne({ menu_title: oldname });
    if (!existingMenu) {
      res.status(404).json({ message: "Menu not found" });
      return;
    }
    let status = 0 ;
    // Process image: Either Base64 from body or convert from file
       // Process image: Either Base64 from body or convert and compress from file
       let menu_image = existingMenu.menu_image; // Default to the existing image

       if (req.body.menu_image) {
         // If a new Base64 string is provided
         
         menu_image = req.body.menu_image;
         console.log("menu_image is string",menu_image);
       } else if (req.file) {
         // If a file is uploaded, compress and convert to Base64
         console.log("menu_image is file");

         const fileBuffer = req.file.buffer;
         const base64Data = await compressImageToBase64(fileBuffer);
         menu_image = `data:${req.file.mimetype};base64,${base64Data}`;
       }
   
       // Validate and parse ingredient list
       let parsedIngredientList;
       if (typeof ingredient_list === "string") {
         try {
           parsedIngredientList = JSON.parse(ingredient_list);
         } catch (error) {
           res.status(400).json({
             message: "Invalid ingredient_list format. Must be valid JSON.",
           });
           return;
         }
       } else {
         parsedIngredientList = ingredient_list;
       }
   
       // Fetch ingredients from database
       if (parsedIngredientList) {
         const ingredientNames = parsedIngredientList.map(
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
         parsedIngredientList = parsedIngredientList.map(
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
       }
   
       // Update the menu
       existingMenu.menu_title = menu_title || existingMenu.menu_title;
       existingMenu.menu_description =
         menu_description || existingMenu.menu_description;
       existingMenu.package = menuPackage || existingMenu.package;
       existingMenu.ingredient_list = parsedIngredientList || existingMenu.ingredient_list;
       existingMenu.menu_image = menu_image; // Use updated or existing image
      //  if(!menu_image.includes("blob")){
      //  }
   
       // Save the updated menu
       await existingMenu.save();
   
       res.status(200).json({
         message: "Menu updated successfully",
         menu: existingMenu,
       });
     } catch (error: any) {
       res.status(500).json({ error: error.message });
     }
};
