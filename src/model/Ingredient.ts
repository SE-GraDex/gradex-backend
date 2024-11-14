import mongoose, { Schema, Document } from 'mongoose';

interface  IIngredient extends Document {
    name: string,
    unit: string
}

const ingredientSchema = new Schema<IIngredient>(
    {
        name:{
            type: String,
            required: true,
            unique: true
        },
        unit:{
            type: String,
            required: true
        }
    }
);

const Ingredient = mongoose.model<IIngredient>('Ingredient', ingredientSchema);

export default Ingredient;
