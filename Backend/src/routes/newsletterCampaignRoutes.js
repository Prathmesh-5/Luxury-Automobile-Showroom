import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
    createCampaign,
    getCampaigns,
    getCampaignById,
    getCampaignRecipients,
    exportCampaignRecipientsCsv,
    updateCampaign,
    deleteCampaign,
    sendTestEmail,
    sendCampaign
} from "../controllers/newsletterCampaignController.js";

const router = express.Router();

// Admin protected campaign routes
router.use(protect);

router.post("/", createCampaign);
router.get("/", getCampaigns);
router.get("/:id", getCampaignById);
router.get("/:id/recipients", getCampaignRecipients);
router.get("/:id/export-recipients", exportCampaignRecipientsCsv);
router.put("/:id", updateCampaign);
router.delete("/:id", deleteCampaign);
router.post("/:id/test-email", sendTestEmail);
router.post("/:id/send", sendCampaign);

export default router;
