import mongoose, { Schema, Document } from 'mongoose';

interface IMenu extends Document {
    menu_title: string,
    menu_description: string,
    ingredient_list: mongoose.Types.ObjectId,
    package: mongoose.Types.ObjectId
}

const menuSchema = new Schema<IMenu>(
    {
        menu_title: {
            type: String, 
            required: true
        },
        menu_description: {
            type: String, 
            required: true
        },
        ingredient_list: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        package: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        }
    }
);

const Menu = mongoose.model<IMenu>('Ingredient_list', menuSchema);

export default Menu;