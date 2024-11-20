import mongoose, { Schema, Document, ObjectId } from "mongoose";


interface IDailyOrderList extends Document {
    date: Date
    menu_title: string,
    menu_description: string,
    menu_image: string,
    ingredient_list: ({
        name: string,
        PricePerUnit: number,
        unit: string,
        portion: number
    })[];
}

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
                PricePerUnit: { type: Number, required: true },
                portion: { type: Number, required: true },
                unit: { type: String, required: true }
            },
        ],
    }
)

const DailyOrderList = mongoose.model<IDailyOrderList>('DailyOrderList', dailyOrderListSchema);
export default DailyOrderList;