import express from "express";
import {
    getContactSettings,
    updateContactSettings,
    resetContactSettings
} from "../controllers/contactSettingsController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/")
    .get(getContactSettings)
    .put(protect, updateContactSettings);

router.post("/reset", protect, resetContactSettings);

export default router;
