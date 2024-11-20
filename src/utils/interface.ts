import { Document, ObjectId } from "mongoose";

export interface IDailyOrderList extends Document {
    date: Date;
    menu_title: string;
    menu_description: string;
    menu_image: string;
    ingredient_list: {
        name: string;
        priceperunit: number;
        unit: string;
        portion: number;
    }[];
    status: number;
}
