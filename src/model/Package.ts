import mongoose, { Schema, Document, ObjectId } from 'mongoose';
import { IPackage } from '@/utils/interface';

// เพิ่ม pakage_start_date โดยเก็บเวลาปัจจุบันหลัง user สมัครแล้วเช็คว่ามี package ก่อนหน้ามั้ย
// ถ้ามี ให้เอา end date ของ package ก่อนหน้าเป็น start date ของตัวนี้

const packageSchema = new Schema<IPackage>(
    {

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
        }
    }
);

const Package = mongoose.model<IPackage>('Package', packageSchema);

export default Package;