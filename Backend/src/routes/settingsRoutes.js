import express from "express";
import { getSettings, updateSettings, triggerManualSync } from "../controllers/settingsController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.route("/")
    .get(getSettings)
    .put(updateSettings);

router.post("/sync", triggerManualSync);

export default router;
