import mongoose, { Schema, Document } from 'mongoose';

interface  IIngredient extends Document {
    name: string,
    PricePerUnit: number,
    unit: string
}

const ingredientSchema = new Schema<IIngredient>(
    {
        name:{
            type: String,
            required: true,
            unique: true
        },
        PricePerUnit: {
            type: Number,
            required:true
        },
        unit:{
            type: String,
            required: true
        }
    }
);

const Ingredient = mongoose.model<IIngredient>('Ingredient', ingredientSchema);

export default Ingredient;
