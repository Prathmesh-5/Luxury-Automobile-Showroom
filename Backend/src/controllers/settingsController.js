import Settings from "../models/Settings.js";
import asyncHandler from "../middleware/asyncHandler.js";
import { triggerSync, startSyncScheduler } from "../services/syncService.js";
import ApiResponse from "../utils/apiResponse.js";
import ApiError from "../utils/ApiError.js";

// Get Settings (Admin Only)
export const getSettings = asyncHandler(async (req, res) => {
    let settings = await Settings.findOne();
    if (!settings) {
        settings = await Settings.create({
            googleSheetUrl: "",
            syncEnabled: false,
            syncIntervalMinutes: 60
        });
    }

    res.status(200).json(
        new ApiResponse(200, true, "Settings fetched successfully", settings)
    );
});

// Update Settings (Admin Only)
export const updateSettings = asyncHandler(async (req, res) => {
    const { googleSheetUrl, syncEnabled, syncIntervalMinutes } = req.body;

    let settings = await Settings.findOne();
    if (!settings) {
        settings = new Settings();
    }

    settings.googleSheetUrl = googleSheetUrl !== undefined ? googleSheetUrl : settings.googleSheetUrl;
    settings.syncEnabled = syncEnabled !== undefined ? syncEnabled : settings.syncEnabled;
    settings.syncIntervalMinutes = syncIntervalMinutes !== undefined ? Number(syncIntervalMinutes) : settings.syncIntervalMinutes;

    await settings.save();

    // Restart scheduling task with new configs
    await startSyncScheduler();

    res.status(200).json(
        new ApiResponse(200, true, "Settings updated and scheduler re-aligned successfully", settings)
    );
});

// Trigger Manual Sync (Admin Only)
export const triggerManualSync = asyncHandler(async (req, res) => {
    const syncResult = await triggerSync();
    if (syncResult.success) {
        res.status(200).json(
            new ApiResponse(200, true, `Sync completed. Modified count: ${syncResult.count}`, syncResult)
        );
    } else {
        throw new ApiError(500, `Manual sync execution failed: ${syncResult.message}`);
    }
});
