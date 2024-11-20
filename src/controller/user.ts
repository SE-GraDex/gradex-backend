import { Request, Response } from 'express';
import User from '../model/User';
import DailyOrderList from '@/model/Daily_order_list';

import jwt from 'jsonwebtoken';

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


