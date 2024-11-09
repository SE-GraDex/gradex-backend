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

exports.addUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const newUser = new User(req.body as IUser);
        await newUser.save();
        res.sendStatus(201);
    } catch (err) {
        console.log(err instanceof Error ? err.message : 'Unknown error');
        res.status(500).send({ message: err instanceof Error ? err.message : 'Unknown error' });
    }
}

exports.getUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).send({ message: 'ID parameter is missing' });
        }
        const user = await User.findById(id, { password: 0 });

        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }
        res.status(200).send(user);
    } catch (err) {
        console.log(err instanceof Error ? err.message : 'Unknown error');
        res.status(500).send({ message: 'Internal Server Error' });
    }
};

exports.getAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await User.find();

        if (users.length === 0) { // Check if the users array is empty
            return res.status(404).send({ message: 'No users found' });
        }

        res.status(200).send(users);
    } catch (err) {
        console.log(err instanceof Error ? err.message : 'Unknown error');
        res.status(500).send({ message: 'Internal Server Error' });
    }
};

