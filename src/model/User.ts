import mongoose, { Schema, Document } from 'mongoose';

// Define the IUser interface
interface IUser extends Document {
    email: string;
    password: string;
    role: 'CUSTOMER' | 'MEAL DESIGNER' | 'MESSENGER';
    firstname: string;
    lastname: string;
    addressName: string;
    addressUnitNumber: string;
    streetNumber: string;
    city: string;
    region: string;
    postalCode: string;
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
    },
    {
        timestamps: true,
    }
);

// Create the User model using the schema
const User = mongoose.model<IUser>('User', userSchema);

export default User;
