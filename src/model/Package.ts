import mongoose, { Schema, Document, ObjectId } from 'mongoose';

interface IPackage extends Document {
    user_id: ObjectId,
    package_name: 'Basic' | 'Deluxe' | 'Premium',
    price: number,
    features: string,
    package_start_date: Date,
    package_end_date: Date
}

// เพิ่ม pakage_start_date โดยเก็บเวลาปัจจุบันหลัง user สมัครแล้วเช็คว่ามี package ก่อนหน้ามั้ย
// ถ้ามี ให้เอา end date ของ package ก่อนหน้าเป็น start date ของตัวนี้

const packageSchema = new Schema<IPackage>(
    {
        user_id:{
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        package_name: {
            type: String,
            enum: ['Basic', 'Deluxe', 'Premium'],
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
        package_start_date: {
            type: Date,
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