import mongoose from "mongoose";
import dotenv from "dotenv";
import Brand from "./models/Brand.js";
import Car from "./models/Car.js";

dotenv.config();

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/luxury_showroom";
console.log("Connecting to:", uri);

mongoose.connect(uri)
    .then(async () => {
        console.log("✅ MongoDB Connected successfully!");
        const brandCount = await Brand.countDocuments();
        const carCount = await Car.countDocuments();
        console.log(`Brands in DB: ${brandCount}`);
        console.log(`Cars in DB: ${carCount}`);
        process.exit(0);
    })
    .catch(err => {
        console.error("❌ MongoDB Connection Error:", err);
        process.exit(1);
    });
