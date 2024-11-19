import mongoose, { Schema, Document, ObjectId } from 'mongoose';

interface IPackage extends Document {
    user_id: ObjectId,
    name: string,
    price: number,
    features: string,
    package_end_date: Date
}

const packageSchema = new Schema<IPackage>(
    {
        user_id:{
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
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

const Package = mongoose.model<IPackage>('Package', packageSchema);

export default Package;