import express from "express";
import { getFooterSettings, updateFooterSettings, resetFooterSettings } from "../controllers/footerSettingsController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/")
    .get(getFooterSettings)
    .put(protect, updateFooterSettings);

router.post("/reset", protect, resetFooterSettings);

export default router;
