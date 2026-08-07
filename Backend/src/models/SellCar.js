import mongoose from "mongoose";

const sellCarSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true
        },
        phone: {
            type: String,
            required: true,
            trim: true
        },
        carBrand: {
            type: String,
            required: true,
            trim: true
        },
        carModel: {
            type: String,
            required: true,
            trim: true
        },
        carYear: {
            type: Number,
            required: true
        },
        mileage: {
            type: Number,
            required: true
        },
        condition: {
            type: String,
            enum: ["New", "Used"],
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        message: {
            type: String,
            default: ""
        },
        images: [
            {
                type: String
            }
        ],
        status: {
            type: String,
            enum: ["New", "Contacted", "Closed"],
            default: "New"
        }
    },
    {
        timestamps: true
    }
);

const SellCar = mongoose.model("SellCar", sellCarSchema);

export default SellCar;
