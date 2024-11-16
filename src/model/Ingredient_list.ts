import mongoose, { Schema, Document, ObjectId } from 'mongoose';
import Ingredient from './Ingredient';
 
interface IIngredientList extends Document {
    ingredientId: ObjectId, 
    portion: number 
}

const ingredientListSchema = new Schema<IIngredientList>(
    {
        ingredientId: {
            type: Schema.Types.ObjectId,
            ref: 'Ingredient'
        },
        portion: {
            type: Number, 
            required: true
        }
    }
);

const Ingredient_list = mongoose.model<IIngredientList>('Ingredient_list', ingredientListSchema);

export default Ingredient_list;