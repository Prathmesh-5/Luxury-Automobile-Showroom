import express from "express";
import { getAboutSettings, updateAboutSettings, resetAboutSettings } from "../controllers/aboutSettingsController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/")
    .get(getAboutSettings)
    .put(protect, updateAboutSettings);

router.post("/reset", protect, resetAboutSettings);

export default router;
