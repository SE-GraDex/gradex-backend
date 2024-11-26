import mongoose, { Schema, Document } from 'mongoose';

interface IShipping extends Document {
    tracking_number: string,
    customer_name: string,
    address: string,
    contact: string,
    status: 'Ongoing' | 'Delivered' | 'Returned' | 'Failed to Deliver'
}

const shippingSchema = new Schema<IShipping>(
    {
        tracking_number:{
            type: String,
            required: true
        },
        customer_name: {
            type: String,
            required: true
        },
        address: {
            type: String, 
            required: true
        },
        contact: {
            type: String, 
            required: true
        },
        status: {
            type: String,
            enum: ['Ongoing' , 'Delivered' , 'Returned' , 'Failed to Deliver'],
            required: true 
        }
    }
);

const Shipping = mongoose.model<IShipping>('Shipping', shippingSchema);

export default Shipping;