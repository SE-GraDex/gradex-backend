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
            type: String, 
            enum: ['basic', 'deluxe', 'premium'],
            required: true 
          }
    }
);

const Menu = mongoose.model<IMenu>('Menu', menuSchema);

export default Menu;