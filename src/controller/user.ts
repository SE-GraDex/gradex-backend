import { Request, Response } from 'express';
import User from '../model/User';
import DailyOrderList from '@/model/Daily_order_list';

import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongoose';
import { IDailyOrderList } from "@/utils/interface";
import { IPackage, IMenu } from '@/utils/interface';
import Package from '@/model/Package';

import { v4 as uuidv4 } from 'uuid';
import Menu from '@/model/Menu';



const secret = process.env.JWT_SECRET || "fallback_secret";

const getEndPackageDate = (package_start_date: Date) => {

    // Add 30 days to the start date
    const endDate = new Date(package_start_date);
    endDate.setDate(endDate.getDate() + 30);
    return endDate;
}

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
            .populate<{ daily_order_list: IDailyOrderList[] }>('daily_order_list')
            .populate<{ package: IPackage[] }>('package');

        if (!user) {
            res.status(404).send({ message: "User not found" });
            return;
        }

        const currentPackage = user.package.find(pkg => {
            const currentDate = new Date();
            return pkg.package_start_date <= currentDate && getEndPackageDate(pkg.package_start_date) >= currentDate;
        });

        if (!currentPackage) {
            res.status(404).send({ message: "No active package found for the user" });
            return;
        }

        const { date, menu_title, menu_description, menu_image, ingredient_list, status } = req.body;

        // console.log("Date from req.body", date);
        // Validate ingredient_list
        if (!Array.isArray(ingredient_list)) {
            res.status(400).send({ message: "'ingredient_list' must be an array" });
            return;
        }

        const invalidIngredient = ingredient_list.find(
            (item: any) =>
                !item.name ||
                item.priceperunit === undefined ||
                item.portion === undefined ||
                !item.unit
        );

        if (invalidIngredient) {
            res.status(400).send({
                message: "Invalid ingredient_list: Each ingredient must have 'name', 'priceperunit', 'portion', and 'unit'.",
                invalidIngredient,
            });
            return;
        }

        const existingOrder = user.daily_order_list.find(order => {
            const orderDate = new Date(order.date);
            const comparisonDate = new Date(date);
            return orderDate.toISOString().slice(0, 10) === comparisonDate.toISOString().slice(0, 10);
        });

        if (existingOrder) {
            existingOrder.menu_title = menu_title;
            existingOrder.menu_description = menu_description;
            existingOrder.menu_image = menu_image;
            existingOrder.ingredient_list = ingredient_list;
            existingOrder.status = status;

            await existingOrder.save();

            res.status(200).send({
                message: "Daily Order updated successfully",
                data: existingOrder,
            });
        } else {
            const trackingNumber = `${currentPackage.package_name.slice(0, 2).toUpperCase()}-${uuidv4()}`;
            const newOrder = new DailyOrderList({
                date,
                menu_image,
                menu_title,
                menu_description,
                ingredient_list,
                status,
                tracking_number: trackingNumber
            });

            await newOrder.save();
            user.daily_order_list.push(newOrder._id as IDailyOrderList);

            await user.save();

            res.status(201).send({
                message: "Daily Order added successfully",
                data: user,
            });
        }
    } catch (err) {
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

export const autoFill = async (req: Request, res: Response): Promise<void> => {
    try {
        const token = req.cookies?.token;
        if (!token) {
            res.status(401).json({ message: "Unauthorized: No token provided" });
            return;
        }

        let decoded: { email: string; role: string };
        try {
            decoded = jwt.verify(token, secret) as { email: string; role: string };
        } catch (err) {
            res.status(401).json({ message: "Unauthorized: Invalid or expired token" });
            return;
        }

        const user = await User.findOne({ email: decoded.email })
            .select('-password')
            .populate<{ daily_order_list: IDailyOrderList[] }>('daily_order_list')
            .populate<{ package: IPackage[] }>('package');

        if (!user) {
            res.status(404).send({ message: "User not found" });
            return;
        }

        const currentPackage = user.package.find(pkg => {
            const currentDate = new Date();
            return (
                pkg.package_start_date <= currentDate &&
                getEndPackageDate(pkg.package_start_date) >= currentDate
            );
        });

        if (!currentPackage) {
            res.status(404).send({ message: "No active package found for the user" });
            return;
        }

        const menus = await Menu.find({ package: currentPackage.package_name })
            .populate('ingredient_list.ingredientId', 'name');

        if (!menus.length) {
            res.status(404).send({ message: "No menus found for the active package" });
            return;
        }

        const shuffledMenus = [...menus].sort(() => Math.random() - 0.5);

        let previousMenu: IMenu | null = null;
        const newOrders = [];

        for (let i = 0; i < 30; i++) {
            const currentDate = new Date(currentPackage.package_start_date);
            currentDate.setDate(currentDate.getDate() + i);

            const existingOrder = user.daily_order_list.find(order => {
                const orderDate = new Date(order.date).toISOString().slice(0, 10);
                return orderDate === currentDate.toISOString().slice(0, 10);
            });

            if (!existingOrder) {
                let randomMenu: IMenu;
                let attempts = 0;

                do {
                    randomMenu = shuffledMenus[i % shuffledMenus.length];
                    attempts++;

                    if (menus.length === 1 || attempts > menus.length) {
                        break;
                    }
                } while (randomMenu === previousMenu);

                previousMenu = randomMenu;

                const trackingNumber = `${currentPackage.package_name.slice(0, 2).toUpperCase()}-${uuidv4()}`;
                const newOrder = new DailyOrderList({
                    date: currentDate,
                    menu_image: randomMenu.menu_image,
                    menu_title: randomMenu.menu_title,
                    menu_description: randomMenu.menu_description,
                    ingredient_list: randomMenu.ingredient_list,
                    status: 1,
                    tracking_number: trackingNumber,
                });

                await newOrder.save();
                user.daily_order_list.push(newOrder._id as IDailyOrderList);
                newOrders.push(newOrder);
            } else {
                previousMenu = menus.find(menu => menu.menu_title === existingOrder.menu_title) || null;
            }
        }

        await user.save();

        res.status(201).send({
            message: "Daily orders added successfully",
            data: newOrders,
        });
    } catch (error) {
        console.error('Error fetching user package:', error);
        res.status(500).json({ message: 'An error occurred while processing autofill.' });
    }
};


const packageHierarchy = ['Basic', 'Deluxe', 'Premium'];

export const addUserPackage = async (req: Request, res: Response): Promise<void> => {
    try {
        const token = req.cookies?.token;
        if (!token) {
            res.status(401).send({ message: "Unauthorized: No token provided" });
            return;
        }

        const decoded = jwt.verify(token, secret) as { email: string; role: string };

        const user = await User.findOne({ email: decoded.email })
            .select('-password')
            .populate<{ package: IPackage[] }>('package'); // Populate packages

        if (!user) {
            res.status(404).send({ message: "User not found" });
            return;
        }

        // Extract package details from the request body
        const { package_name, price, features, package_start_date } = req.body as IPackage;

        // Check if the user already has the requested package
        const existingPackage = user.package.find(pkg => pkg.package_name === package_name);
        if (existingPackage) {
            res.status(200).json({
                message: 'User already has this package. No changes were made.',
                package: existingPackage
            });
            return;
        }

        // Get the highest priority package the user already has
        const userPackages = user.package;
        const userPackagePriorities = userPackages.map(pkg => packageHierarchy.indexOf(pkg.package_name));

        // Find the highest priority package user currently has
        const highestPriorityIndex = Math.max(...userPackagePriorities);

        // Check if the new package is a higher priority than the user's highest existing package
        const newPackagePriorityIndex = packageHierarchy.indexOf(package_name);
        if (newPackagePriorityIndex <= highestPriorityIndex) {
            res.status(400).json({
                message: 'Cannot add a lower or same priority package. Please add a higher priority package.'
            });
            return;
        }

        // Calculate the new package start date
        let newPackageStartDate: Date;
        if (userPackages.length === 0) {
            // If no packages exist, use the provided package_start_date
            newPackageStartDate = new Date(package_start_date);
        } else {
            // Otherwise, set the start date to 31 days after the last package's start date
            const lastPackage = userPackages.sort((a, b) => new Date(b.package_start_date).getTime() - new Date(a.package_start_date).getTime())[0];
            newPackageStartDate = new Date(lastPackage.package_start_date);
            newPackageStartDate.setDate(newPackageStartDate.getDate() + 31);
        }

        // Create and save the new package
        const newPackage = new Package({
            package_name,
            price,
            features,
            package_start_date: newPackageStartDate
        } as IPackage);

        await newPackage.save();
        user.package.push(newPackage._id as IPackage);
        await user.save();

        res.status(200).json({
            message: 'User package added successfully',
            package: newPackage
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


export const getCurrentUserPackage = async (req: Request, res: Response): Promise<void> => {
    try {
        const token = req.cookies?.token;
        if (!token) {
            res.status(401).json({ message: "Unauthorized: No token provided" });
            return;
        }

        let decoded: { email: string; role: string };
        try {
            decoded = jwt.verify(token, secret) as { email: string; role: string };
        } catch (err) {
            res.status(401).json({ message: "Unauthorized: Invalid or expired token" });
            return;
        }

        const user = await User.findOne({ email: decoded.email })
            .select('-password') // Exclude password
            .populate<{ package: IPackage[] }>('package'); // Populate packages

        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        const currentDate = new Date();
        const activePackage = user.package.find((pkg) => {
            const startDate = new Date(pkg.package_start_date);
            const endDate = getEndPackageDate(startDate);
            return startDate <= currentDate && endDate >= currentDate;
        });



        if (!activePackage) {
            res.status(404).json({ message: "No active package found" });
            return;
        }

        // Calculate the package end date
        const endDate = getEndPackageDate(new Date(activePackage.package_start_date));

        const data = {
            activePackage,
            package_end_date: endDate.toISOString(), // Return the end date in ISO format
        };

        res.status(200).json({
            message: "Active package retrieved successfully",
            data,
        });
    } catch (error) {
        console.error('Error fetching user package:', error);
        res.status(500).json({ message: 'An error occurred while fetching user package.' });
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
