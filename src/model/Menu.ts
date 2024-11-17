import mongoose, { Schema, Document, ObjectId } from 'mongoose';

interface IMenu extends Document {
    menu_title: string,
    menu_description: string,
    ingredient_list: ObjectId[],
    package: ObjectId
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
        ingredient_list: [{ 
            type: Schema.Types.ObjectId, 
            ref: 'IngredientList' 
        }],
        package: {
            type: Schema.Types.ObjectId,
            ref: 'Package',
        }
    }
);

const Menu = mongoose.model<IMenu>('Ingredient_list', menuSchema);

export default Menu;