import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
        if (!mongoUri) {
            throw new Error("Neither MONGODB_URI nor MONGO_URI is set in environment variables.");
        }
        await mongoose.connect(mongoUri);

        console.log("✅ MongoDB Connected Successfully");
    } catch (error) {
        console.error("❌ MongoDB Connection Failed");
        console.error(error.message);

        process.exit(1);
    }
};

export default connectDB;