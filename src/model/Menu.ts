import mongoose, { Schema, Document, ObjectId } from "mongoose";

interface IIngredient extends Document {
  name: string;
  pricePerUnit: number;
  unit: string;
}

interface IMenu extends Document {
  menu_title: string;
  menu_description: string;
  ingredient_list: {
    ingredientId: IIngredient; // Use IIngredient to refer to the populated document
    portion: number;
    // priceperunit: number;
    // unit: string;
  }[];
  package: "Basic" | "Deluxe" | "Premium";
  menu_image: string;
}

const menuSchema = new Schema<IMenu>({
  menu_title: {
    type: String,
    required: true,
  },
  menu_description: {
    type: String,
    required: true,
  },
  ingredient_list: [
    {
      ingredientId: {
        type: Schema.Types.ObjectId,
        ref: "Ingredient",
        required: true,
      },
      portion: {
        type: Number,
        required: true,
      },
    //   priceperunit: {  
    //   type: Number, 
    //   // required: true
    //  }
    //  ,
      
    //   unit:{
    //     type: String,
    //     // required: true
    //   }

    },
  ],
  package: {
    type: String,
    enum: ["Basic", "Deluxe", "Premium"],
    required: true,
  },

  menu_image: {
    type: String,
    required: true,
  },
});

const Menu = mongoose.model<IMenu>("Menu", menuSchema);

export default Menu;
