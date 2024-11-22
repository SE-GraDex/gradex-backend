import mongoose, { Schema, Document } from 'mongoose';

interface IIngredient extends Document {
    name: string;
    priceperunit: number;
    unit: string;
}

const ingredientSchema = new Schema<IIngredient>({
    name: { type: String, required: true },
    priceperunit: { type: Number, required: true },
    unit: { type: String, required: true }
});

const Ingredient = mongoose.model<IIngredient>('Ingredient', ingredientSchema);

export default Ingredient;
