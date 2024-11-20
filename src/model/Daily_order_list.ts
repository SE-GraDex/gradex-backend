import mongoose, { Schema, Document, ObjectId } from "mongoose";


interface IDailyOrderList extends Document {
    date: Date
    menu: ObjectId
}

const DailyOrderListSchema = new mongoose.Schema<IDailyOrderList>(
    {
        date: {
            type: Date,
            required: true
        },
        menu: {
            type: Schema.Types.ObjectId,
            ref: 'Menu',
            required: true,
        }
    }
)

const DailyOrderList = mongoose.model<IDailyOrderList>('DailyOrderList', DailyOrderListSchema);

export default DailyOrderList;