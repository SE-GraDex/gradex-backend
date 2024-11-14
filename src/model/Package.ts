import mongoose, { Schema, Document } from 'mongoose';

interface IPackage extends Document {
    name: string,
    price: number,
    features: string,
    package_end_date: Date
}

const packageSchema = new Schema<IPackage>(
    {
        name: {
            type: String, 
            required: true
        },
        price: {
            type: Number, 
            required: true
        },
        features: {
            type: String, 
            required: true
        },
        package_end_date: {
            type: Date,
            required: true 
        }
    }
);

const Package = mongoose.model<IPackage>('Ingredient_list', packageSchema);

export default Package;