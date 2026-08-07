import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import Admin from "./src/models/Admin.js";

// Load environment variables
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || "mongodb://localhost:27017/luxury_showroom";

const seedAdmin = async () => {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(MONGO_URI);
        console.log("✅ Connected to MongoDB");

        const adminEmail = "brontobyte11111@gmail.com";
        const adminName = "Showroom Admin";
        const plainPassword = "Luxary1@";

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ email: adminEmail.toLowerCase().trim() });
        if (existingAdmin) {
            console.log("Admin already exists.");
            await mongoose.connection.close();
            process.exit(0);
        }

        // Hash the password using bcrypt with 10 salt rounds
        const hashedPassword = await bcrypt.hash(plainPassword, 10);

        // Save new admin to MongoDB
        await Admin.create({
            name: adminName,
            email: adminEmail.toLowerCase().trim(),
            password: hashedPassword
        });

        console.log("Admin created successfully.");
        console.log("\n------------------------------------");
        console.log("Admin Created Successfully");
        console.log(`Name: ${adminName}`);
        console.log(`Email: ${adminEmail}`);
        console.log("------------------------------------\n");

    } catch (error) {
        console.error("❌ Error seeding admin:", error);
    } finally {
        await mongoose.connection.close();
    }
};

seedAdmin();
