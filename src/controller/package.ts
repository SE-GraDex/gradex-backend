import Package from '@/model/Package';
import { Request, Response } from 'express';
import { ObjectId } from 'mongoose';

interface IPackage {
    user_id: ObjectId,
    name: string,
    price: number,
    features: string,
    package_end_date: Date
}

// mock up data
// {
//     "name": "Basic",
//     "price": 29,
//     "features": "Access to basic features, Standard support, Monthly newsletter",
//     "package_end_date": "2024-11-17T23:59:59.000Z"
// }

export const createPackage = async (req: Request, res: Response): Promise<void> => {
    try {
        const { user_id , name , price , features , package_end_date } = req.body as IPackage;
        const newPackage = new Package({ user_id , name , price , features , package_end_date } as IPackage);
        await newPackage.save();
        res.status(200).json({
            message: 'Package created successfully',
            package: newPackage
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
    
};

export const getAllPackages = async (req: Request , res: Response): Promise<void> => {
    try {
        const packages = await Package.find();
        res.status(200).json(packages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const deleteExpiredPackages = async (req: Request, res: Response): Promise<void> => {
    try {
        // Get the current date and set it to midnight (00:00:00) to ignore the time part
        const currentDate = new Date();

        const result = await Package.deleteMany({
            package_end_date: {
                $lte: currentDate
            }
        });

        res.status(200).json({ message: `${result.deletedCount} package(s) deleted` });
        // res.status(200).json({ message: `${currentDate.toISOString().split('T')[0]}` });
    } catch (error) {
        console.error('Error deleting expired packages:', error);
        res.status(500).json({ message: 'An error occurred while deleting expired packages.', error });
    }
};

export const deletePackageById = async (req: Request, res: Response): Promise<void> => {
    try {
        const packages = await Package.findByIdAndDelete(req.params.id);
        
        if (!packages) {
            res.status(404).json({ message: 'Package not found' });
            return;
        }

        res.status(200).json({
            message: 'Package deleted successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};