import DailyOrderList from "@/model/Daily_order_list";
import Shipping from "@/model/Shipping";
import User from "@/model/User";
import { Request, Response } from "express";

interface IShipping {
  tracking_number: string;
  customer_name: string;
  address: string;
  contact: string;
  status: "Ongoing" | "Derivered" | "Returned" | "Failed to Deliver";
}

// only 1 messenger in Gradex then has only 1 contact
const ContactMessenger = "060000000";
// Get all shippings
export const createShipping = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { tracking_number } = req.body as IShipping;
    // Fetch user details to populate shipping data
    const messenger = await User.findOne({ role: "MESSENGER" }).select(
      "firstname lastname",
    );
    if (!messenger) {
      res
        .status(404)
        .json({ success: false, message: "No messenger user found" });
      return;
    }
    const tracking_number_data = await DailyOrderList.findOne({
      tracking_number: tracking_number,
    }).select("_id");
    if (!tracking_number_data) {
      res
        .status(404)
        .json({
          success: false,
          message: "Not found an _id that match tracking number ",
        });
      return;
    }
    const customerAddress = await User.findOne({
      daily_order_list: tracking_number_data,
    }).select("addressName");
    if (!customerAddress) {
      res
        .status(404)
        .json({
          success: false,
          message:
            "Can not get customer address that has a matching tracking number",
        });
      return;
    }

    const newShipping = new Shipping({
      tracking_number: tracking_number,
      customer_name: `${messenger.firstname} ${messenger.lastname}`,
      address: customerAddress?.addressName,
      contact: ContactMessenger,
      status: "Ongoing",
    } as IShipping);
    await newShipping.save();
    // Respond with the generated shipping data
    res.status(201).json({
      message: "Shipping created successfully",
      shipping: newShipping,
    });
  } catch (error: any) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to retrieve shipping data",
        error: error.message,
      });
  }
};

export const updateShipping = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { status } = req.body; // Status from request body
    // Ensure status is one of the allowed values
    const allowedStatuses = [
      "Ongoing",
      "Derivered",
      "Returned",
      "Failed to Deliver",
    ];
    if (!allowedStatuses.includes(status)) {
      res.status(400).json({ success: false, message: "Invalid status value" });
      return;
    }
    const updateShipping = await Shipping.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }, // Return the updated document
    );

    if (!updateShipping) {
      res.status(404).json({ message: "Shipping not found" });
      return;
    }

    res.status(200).json({
      message: "Shipping updated successfully",
      updateShipping,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllShippings = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const shipping = await Shipping.find();
    res.status(200).json(shipping);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
// for test
export const deleteShippingById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    const deletedShipping = await Shipping.findByIdAndDelete(id);
    if (!deletedShipping) {
      res.status(404).json({ message: "Menu not found" });
      return;
    }

    res
      .status(200)
      .json({
        message: "Shipping deleted successfully",
        shipping: deletedShipping,
      });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
