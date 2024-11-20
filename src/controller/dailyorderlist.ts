import { Request, Response } from "express";
import DailyOrderList from "@/model/Daily_order_list";

// Add a new DailyOrderList
export const addDailyOrderList = async (req: Request, res: Response): Promise<void> => {
    try {

        const { date, menu_title, menu_description, menu_image, ingredient_list } = req.body;

        const newOrder = new DailyOrderList({
            date,
            menu_image,
            menu_title,
            menu_description,
            ingredient_list,
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