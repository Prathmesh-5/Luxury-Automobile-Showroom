import mongoose from "mongoose";
import dotenv from "dotenv";
import Brand from "./models/Brand.js";
import Car from "./models/Car.js";

dotenv.config();

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/luxury_showroom";

mongoose.connect(uri)
    .then(async () => {
        console.log("--- BRANDS ---");
        const brands = await Brand.find();
        console.log(JSON.stringify(brands, null, 2));

        console.log("--- CARS ---");
        const cars = await Car.find().populate("brandId");
        console.log(JSON.stringify(cars, null, 2));

        process.exit(0);
    })
    .catch(err => {
        console.error("Error:", err);
        process.exit(1);
    });
