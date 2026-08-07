import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./config/db.js";
import { startSyncScheduler } from "./services/syncService.js";
import Car from "./models/Car.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

// Connect Database and Start Scheduler
connectDB().then(async () => {
    try {
        await Car.updateMany(
            { $or: [{ featuredPriority: { $exists: false } }, { featuredPriority: null }] },
            { $set: { featuredPriority: 9999 } }
        );
        console.log("✅ Existing vehicles without featuredPriority migrated successfully to default 9999.");
    } catch (err) {
        console.error("❌ Failed to migrate featuredPriority field:", err.message);
    }
    startSyncScheduler();
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});