import mongoose, { Schema, Document, ObjectId } from 'mongoose';
import { IMenu, IPackage } from '@/utils/interface';
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
        ingredient_list: [
            {
                ingredientId: {
                    type: Schema.Types.ObjectId,
                    ref: 'Ingredient',
                    required: true
                },
                portion: {
                    type: Number,
                    required: true
                }
            }
        ],
        package: {
            type: String,
            enum: ['basic', 'deluxe', 'premium'],
            required: true
        },
        menu_image: {
            type: String,
            required: true
        }
    }
);

const Menu = mongoose.model<IMenu>('Menu', menuSchema);

export default Menu;
