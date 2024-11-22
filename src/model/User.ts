import mongoose, { Schema, Document, ObjectId } from 'mongoose';

// Define the IUser interface
interface IUser extends Document {
    email: string,
    password: string,
    role: 'CUSTOMER' | 'MEAL DESIGNER' | 'MESSENGER',
    firstname: string,
    lastname: string,
    addressName: string,
    addressUnitNumber: string,
    streetNumber: string,
    city: string,
    region: string,
    postalCode: string,
    package: ObjectId[]
    daily_order_list: ObjectId[]
}

// Define the user schema
const userSchema = new Schema<IUser>(
    {
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            default: 'CUSTOMER',
            enum: ['CUSTOMER', 'MEAL DESIGNER', 'MESSENGER'],
            required: true,
        },
        firstname: {
            type: String,
            required: true,
        },
        lastname: {
            type: String,
            required: true,
        },
        addressName: {
            type: String,
            required: true,
        },
        addressUnitNumber: {
            type: String,
            required: true,
        },
        streetNumber: {
            type: String,
            required: true,
        },
        city: {
            type: String,
            required: true,
        },
        region: {
            type: String,
            required: true,
        },
        postalCode: {
            type: String,
            required: true,
        },
        package: [{
            type: Schema.Types.ObjectId,
            ref: 'Package',
        }],
        daily_order_list: [
            {
                type: Schema.Types.ObjectId,
                ref: 'DailyOrderList'
            }
        ]

    },
    {
        timestamps: true,
    }
);

// Create the User model using the schema
const User = mongoose.model<IUser>('User', userSchema);

export default User;
