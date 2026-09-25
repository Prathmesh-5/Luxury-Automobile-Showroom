import express from "express";
import { getHeroSettings, updateHeroSettings } from "../controllers/heroSettingsController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/")
    .get(getHeroSettings)
    .put(protect, updateHeroSettings);

export default router;
