import Package from '@/model/Package';
import User from '@/model/User';
import { Request, Response } from 'express';
import { ObjectId } from 'mongoose';

interface IPackage {
    user_id: ObjectId,
    package_name: 'Basic' | 'Deluxe' | 'Premium',
    price: number,
    features: string,
    package_start_date: Date,
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
        const { user_id, package_name, price, features, package_start_date } = req.body as IPackage;

        const startDate = new Date(package_start_date);

        // Add 30 days to the start date
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 30);
        const newPackage = new Package({
            user_id,
            package_name,
            price,
            features,
            package_start_date,
            package_end_date: endDate
        } as IPackage);
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

export const getAllPackages = async (req: Request, res: Response): Promise<void> => {
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

        // Find obsolete packages
        const obsoletePackages = await Package.find({
            package_end_date: {
                $lte: currentDate
            }
        });

        // Extract _id values from obsolete packages
        const packageIds = obsoletePackages.map(pkg => pkg._id);

        if (packageIds.length === 0) {
            res.status(200).json({ message: 'No expired packages to delete.' });
            return;
        }

        // Remove package IDs from user schema
        const result = await User.updateMany(
            { package: { $in: packageIds } }, // Match users with these package IDs
            { $pull: { package: { $in: packageIds } } } // Remove the package IDs from the array
        );

        // Optionally, delete the obsolete packages from the database
        await Package.deleteMany({ _id: { $in: packageIds } });

        res.status(200).json({
            message: `Removed ${packageIds.length} expired packages and updated ${result.modifiedCount} user(s).`
        });
    } catch (error) {
        console.error('Error deleting expired packages:', error);
        res.status(500).json({
            message: 'An error occurred while deleting expired packages.',
            error
        });
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