import { Request, Response } from 'express';
import User from '../model/User';
import DailyOrderList from '@/model/Daily_order_list';

import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongoose';
import { IDailyOrderList } from "@/utils/interface";


const secret = process.env.JWT_SECRET || "fallback_secret";

interface IUser {
    email: string;
    password: string;
    role?: 'CUSTOMER' | 'MEAL DESIGNER' | 'MESSENGER';
    firstname: string;
    lastname: string;
    addressName: string;
    addressUnitNumber: string;
    streetNumber: string;
    city: string;
    region: string;
    postalCode: string;
}

export const addUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const newUser = new User(req.body as IUser);
        await newUser.save();
        res.sendStatus(201);  // No need to return the response
    } catch (err) {
        console.log(err instanceof Error ? err.message : 'Unknown error');
        res.status(500).send({ message: err instanceof Error ? err.message : 'Unknown error' });
    }
};

export const getUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        if (!id) {
            res.status(400).send({ message: 'ID parameter is missing' });
            return;
        }
        const user = await User.findById(id, { password: 0 });

        if (!user) {
            res.status(404).send({ message: 'User not found' });
            return;
        }
        res.status(200).send(user);
    } catch (err) {
        console.log(err instanceof Error ? err.message : 'Unknown error');
        res.status(500).send({ message: 'Internal Server Error' });
    }
};

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const users = await User.find();

        if (users.length === 0) { // Check if the users array is empty
            res.status(404).send({ message: 'No users found' });
            return;
        }

        res.status(200).send(users);
    } catch (err) {
        console.log(err instanceof Error ? err.message : 'Unknown error');
        res.status(500).send({ message: 'Internal Server Error' });
    }
};


export const currentDailyOrderList = async (req: Request, res: Response): Promise<void> => {
    try {
        const token = req.cookies?.token;

        if (!token) {
            res.status(401).send({ message: "Unauthorized: No token provided" });
            return;
        }

        const decoded = jwt.verify(token, secret) as { email: string; role: string };

        const user = await User.findOne({ email: decoded.email }).select('-password'); // Exclude password from the response
        if (!user) {
            res.status(404).send({ message: "User not found" });
            return;
        }

        const data = await user.populate('daily_order_list');

        res.status(200).send(data);
    } catch (err) {
        if (err instanceof jwt.JsonWebTokenError) {
            res.status(401).send({ message: "Unauthorized: Invalid token" });
        } else {
            console.log(err instanceof Error ? err.message : 'Unknown error');
            res.status(500).send({ message: "Internal Server Error" });
        }
    }
};


export const addDailyOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        const token = req.cookies?.token;
        if (!token) {
            res.status(401).send({ message: "Unauthorized: No token provided" });
            return;
        }

        const decoded = jwt.verify(token, secret) as { email: string; role: string };

        const user = await User.findOne({ email: decoded.email })
            .select('-password')
            .populate<{ daily_order_list: IDailyOrderList[] }>('daily_order_list');

        if (!user) {
            res.status(404).send({ message: "User not found" });
            return;
        }

        const { date, menu_title, menu_description, menu_image, ingredient_list, status } = req.body;

        const existingOrder = user.daily_order_list.find(order => {
            const orderDate = new Date(order.date);
            const comparisonDate = new Date(date);

            // Slice the ISO string to get only the 'YYYY-MM-DD' part
            return orderDate.toISOString().slice(0, 10) === comparisonDate.toISOString().slice(0, 10);
        });

        if (existingOrder) {
            existingOrder.menu_title = menu_title;
            existingOrder.menu_description = menu_description;
            existingOrder.menu_image = menu_image;
            existingOrder.ingredient_list = ingredient_list;
            existingOrder.status = status;

            // Save the updated order
            await existingOrder.save();

            res.status(200).send({
                message: "Daily Order updated successfully",
                data: existingOrder
            });
        } else {
            const newOrder = new DailyOrderList({
                date,
                menu_image,
                menu_title,
                menu_description,
                ingredient_list,
                status
            });

            await newOrder.save();
            user.daily_order_list.push(newOrder._id as IDailyOrderList);

            await user.save();

            res.status(201).send({
                message: "Daily Order added successfully",
                data: user
            });
        }

    } catch (err) {
        // Handle specific JWT errors
        if (err instanceof jwt.JsonWebTokenError) {
            res.status(401).send({ message: "Unauthorized: Invalid token" });
        } else if (err instanceof jwt.TokenExpiredError) {
            res.status(401).send({ message: "Unauthorized: Token expired" });
        } else {
            console.error(err);
            res.status(500).send({ message: "Internal Server Error" });
        }
    }
};

export const updateOrderCalendar = async (req: Request, res: Response): Promise<void> => {
    try {
        const token = req.cookies?.token;

        if (!token) {
            res.status(401).send({ message: "Unauthorized: No token provided" });
            return;
        }

        const decoded = jwt.verify(token, secret) as { email: string; role: string };

        const user = await User.findOne({ email: decoded.email })
            .select('-password')
            .populate<{ daily_order_list: IDailyOrderList[] }>('daily_order_list');

        if (!user) {
            res.status(404).send({ message: "User not found" });
            return;
        }

        const ordersInRange = user.daily_order_list.filter(order => {
            return (
                order.date >= new Date('2024-01-01') &&
                order.date <= new Date('2024-12-31') &&
                order.status >= 0
            );
        });

        const response = {
            // name: user.firstname,
            // surname: user.lastname,
            months: {} as { [key: number]: { day: number; detail: any; status: number }[] }
        };

        const getDaysInMonth = (month: number, year: number): number => {
            return new Date(year, month + 1, 0).getDate();
        };

        // Process the orders and map them to months and days
        for (let i = 0; i < 12; i++) {
            const daysInMonth = getDaysInMonth(i, 2024); // Use 2024 as the year
            const monthData = ordersInRange.filter(order => new Date(order.date).getMonth() === i);
            const monthArray = new Array(daysInMonth).fill(null).map((_, dayIndex) => {
                const orderForDay = monthData.find(order => new Date(order.date).getDate() === dayIndex + 1);
                return {
                    day: dayIndex + 1,
                    detail: orderForDay
                        ? {
                            menu_title: orderForDay.menu_title,
                            menu_description: orderForDay.menu_description,
                            menu_image: orderForDay.menu_image,
                            ingredient_list: orderForDay.ingredient_list
                        }
                        : {},
                    status: orderForDay ? orderForDay.status : 0
                };
            });
            response.months[i] = monthArray;
        }

        res.status(200).send(response);
    } catch (err) {
        if (err instanceof jwt.JsonWebTokenError) {
            res.status(401).send({ message: "Unauthorized: Invalid token" });
        } else {
            console.error(err instanceof Error ? err.message : 'Unknown error');
            res.status(500).send({ message: "Internal Server Error" });
        }
    }
};
