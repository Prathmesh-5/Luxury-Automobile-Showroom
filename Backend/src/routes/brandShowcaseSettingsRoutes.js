import express from "express";
import { getBrandShowcaseSettings, updateBrandShowcaseSettings } from "../controllers/brandShowcaseSettingsController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/")
    .get(getBrandShowcaseSettings)
    .put(protect, updateBrandShowcaseSettings);

export default router;
