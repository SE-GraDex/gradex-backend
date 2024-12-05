import { Request, Response } from "express";
import DailyOrderList from "@/model/Daily_order_list";
import Menu from "@/model/Menu";

interface TopMenu {
    menuTitle: string;
    count: number;
}

interface TopOrder {
    _id: string;
    topMenus: TopMenu[];
}

// Add a new DailyOrderList
export const addDailyOrderList = async (req: Request, res: Response): Promise<void> => {
    try {

        const { date, menu_title, menu_description, menu_image, ingredient_list, status, package_name } = req.body;

        const newOrder = new DailyOrderList({
            date,
            menu_image,
            menu_title,
            menu_description,
            ingredient_list,
            status,
            package_name
        });

        const savedOrder = await newOrder.save();

        res.status(201).json({
            message: "Daily Order List added successfully",
            data: savedOrder,
        });

    } catch (error) {
        console.error("Error adding daily order list:", error);
        res.status(500).json({ message: "Internal Server Error", error });
    }
};

export const getAllOrders = async (req: Request, res: Response): Promise<void> => {
    try {
        // Fetch all DailyOrderList documents from the database
        const orders = await DailyOrderList.find();

        // If no orders are found
        if (orders.length === 0) {
            res.status(404).json({ message: "No Daily Orders found" });
            return;
        }

        // Send the list of orders in the response
        res.status(200).json({
            message: "All Daily Orders retrieved successfully",
            data: orders,
        });
    } catch (error) {
        // Error handling
        console.error("Error retrieving all daily orders:", error);
        res.status(500).json({ message: "Internal Server Error", error });
    }
};



export const getTopThreeOrders = async (req: Request, res: Response): Promise<void> => {
    try {
        const topOrders: TopOrder[] = await DailyOrderList.aggregate([
            {
                $group: {
                    _id: "$package_name",
                    menuTitles: { $push: "$menu_title" },
                },
            },
            {
                $unwind: "$menuTitles",
            },
            {
                $group: {
                    _id: { package_name: "$_id", menuTitle: "$menuTitles" },
                    orderCount: { $sum: 1 },
                },
            },
            {
                $sort: { "_id.package_name": 1, orderCount: -1 },
            },
            {
                $group: {
                    _id: "$_id.package_name",
                    topMenus: {
                        $push: {
                            menuTitle: "$_id.menuTitle",
                            count: "$orderCount",
                        },
                    },
                },
            },
            {
                $project: {
                    _id: 1,
                    topMenus: { $slice: ["$topMenus", 3] }, // Limit to top 3 menus
                },
            },
        ]);

        if (topOrders.length === 0) {
            res.status(404).json({ message: "No top orders found" });
            return;
        }

        const menuTitles = topOrders.flatMap((order: TopOrder) =>
            order.topMenus.map((menu: TopMenu) => menu.menuTitle)
        );

        const menus = await Menu.find({ menu_title: { $in: menuTitles } })
            .populate("ingredient_list.ingredientId")
            .lean();

        const transformedMenus = menus.map(menu => ({
            ...menu,
            ingredient_list: menu.ingredient_list.map(ingredient => ({
                name: ingredient.ingredientId.name,
                unit: ingredient.ingredientId.unit,
                priceperunit: ingredient.ingredientId.priceperunit,
                portion: ingredient.portion,
            })),
        }));

        res.status(200).json({ menus: transformedMenus });
    } catch (error) {
        console.error("Error retrieving top orders:", error);
        res.status(500).json({ message: "Internal Server Error", error });
    }
};