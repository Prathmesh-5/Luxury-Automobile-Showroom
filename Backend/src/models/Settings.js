import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
    {
        googleSheetUrl: {
            type: String,
            default: "",
            trim: true
        },
        syncEnabled: {
            type: Boolean,
            default: false
        },
        syncIntervalMinutes: {
            type: Number,
            default: 60,
            min: 5
        },
        lastSyncTime: {
            type: Date
        },
        syncErrors: [
            {
                type: String
            }
        ]
    },
    {
        timestamps: true
    }
);

const Settings = mongoose.model("Settings", settingsSchema);

export default Settings;
