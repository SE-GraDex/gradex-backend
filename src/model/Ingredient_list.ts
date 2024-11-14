import mongoose, { Schema, Document } from 'mongoose';

interface IIngredientList extends Document {
    ingredient: mongoose.Types.ObjectId,
    portion: number 
}

const ingredientListSchema = new Schema<IIngredientList>(
    {
        ingredient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Ingredient', 
            required: true
        },
        portion: {
            type: Number, 
            required: true
        }
    }
);

const Ingredient_list = mongoose.model<IIngredientList>('Ingredient_list', ingredientListSchema);

export default Ingredient_list;