import { Request, Response } from "express";
import DailyOrderList from "@/model/Daily_order_list";

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
        // Aggregate top three menu titles for each package
        const topOrders = await DailyOrderList.aggregate([
            {
                $group: {
                    _id: "$package_name", // Group by package_name directly
                    menuTitles: { $push: "$menu_title" }, // Push menu_title into an array
                    orderCounts: { $push: 1 }, // Count each order
                },
            },
            {
                $project: {
                    _id: 1,
                    menuTitles: 1,
                    orderCounts: { $size: "$menuTitles" }, // Get the number of orders per package
                },
            },
            {
                $unwind: "$menuTitles", // Unwind the menuTitles array so we can count occurrences
            },
            {
                $group: {
                    _id: { package_name: "$_id", menuTitle: "$menuTitles" }, // Group by both package_name and menuTitle
                    orderCount: { $sum: 1 }, // Count occurrences of each menuTitle
                },
            },
            {
                $sort: { "_id.package_name": 1, "orderCount": -1 }, // Sort by package_name and then by orderCount
            },
            {
                $group: {
                    _id: "$_id.package_name", // Group by package_name again
                    topMenus: { $push: { menuTitle: "$_id.menuTitle", count: "$orderCount" } }, // Push top menus
                },
            },
            {
                $project: {
                    _id: 1, // Retain the package_name (_id is the package_name here)
                    topMenus: { $slice: ["$topMenus", 3] }, // Limit to top 3 menus per package
                },
            },
        ]);

        // If no top orders are found
        if (topOrders.length === 0) {
            res.status(404).json({ message: "No top orders found" });
            return;
        }

        // Send the top orders in the response
        res.status(200).json({
            message: "Top three orders retrieved successfully for each package",
            data: topOrders,
        });
    } catch (error) {
        // Error handling
        console.error("Error retrieving top orders:", error);
        res.status(500).json({ message: "Internal Server Error", error });
    }
};
