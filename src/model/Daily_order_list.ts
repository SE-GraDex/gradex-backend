import mongoose, { Schema, Document, ObjectId } from "mongoose";
import { IDailyOrderList } from "@/utils/interface";



const dailyOrderListSchema = new mongoose.Schema<IDailyOrderList>(
    {
        date: {
            type: Date,
            required: true
        },
        menu_image: {
            type: String,
            required: true
        },
        menu_title: {
            type: String,
            required: true
        },
        menu_description: {
            type: String,
            required: true
        },
        ingredient_list: [
            {
                name: { type: String, required: true },
                priceperunit: { type: Number, required: true },
                portion: { type: Number, required: true },
                unit: { type: String, required: true }
            },
        ],
        status: {
            type: Number,
            default: 0,
            required: true
        }
    }
)

const DailyOrderList = mongoose.model<IDailyOrderList>('DailyOrderList', dailyOrderListSchema);
export default DailyOrderList;