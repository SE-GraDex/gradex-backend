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
    package_name: string;
    tracking_number: string;
}

export interface IPackage extends Document {
    user_id: ObjectId,
    package_name: 'Basic' | 'Deluxe' | 'Premium',
    price: number,
    features: string,
    package_start_date: Date
}

export interface IIngredient extends Document {
    name: string;
    pricePerUnit: number;
    unit: string;
}

export interface IMenu extends Document {
    menu_title: string;
    menu_description: string;
    ingredient_list: {
        ingredientId: IIngredient;  // Use IIngredient to refer to the populated document
        portion: number;
    }[];
    package: 'Basic' | 'Deluxe' | 'Premium';
    menu_image: string;
}
