import { Request, Response } from 'express';
import User from '../model/User';

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
