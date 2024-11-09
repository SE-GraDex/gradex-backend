const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: true
        },
        role: {
            type: String,
            default: "CUSTOMER",
            enum: ["CUSTOMER", "MEAL DESIGNER", "MESSENGER"],
            required: true
        },
        firstname: {
            type: String,
            required: true
        },
        lastname: {
            type: String,
            required: true
        },
        addressName: {
            type: String,
            required: true
        },
        addressUnitNumber: {
            type: String,
            required: true
        },
        streetNumber: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        region: {
            type: String,
            required: true
        },
        postalCode: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
);

const User = mongoose.model('User', userSchema);

// Use `export default` for compatibility with TypeScript
export default User;
