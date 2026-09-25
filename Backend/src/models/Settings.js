import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
    {
        googleSheetUrl: {
            type: String,
            default: "",
            trim: true
        },
        googleSpreadsheetId: {
            type: String,
            default: "",
            trim: true
        },
        googleSheetName: {
            type: String,
            default: "Sheet1",
            trim: true
        },
        syncEnabled: {
            type: Boolean,
            default: false
        },
        syncIntervalMinutes: {
            type: Number,
            default: 5,
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
