import express from "express";
import { newsletterLimiter } from "../middleware/rateLimitMiddleware.js";
import { protect } from "../middleware/authMiddleware.js";
import {
    subscribe,
    unsubscribeByToken,
    trackEmailOpen,
    trackLinkClick,
    getAnalytics,
    getSubscribers,
    updateSubscriberStatus,
    bulkUpdateStatus,
    deleteSubscriber,
    bulkDelete,
    exportSubscribersCsv
} from "../controllers/newsletterController.js";

const router = express.Router();

// Public routes
router.post("/subscribe", newsletterLimiter, subscribe);
router.get("/unsubscribe", unsubscribeByToken);
router.get("/track/open/:trackingToken", trackEmailOpen);
router.get("/track/click/:trackingToken", trackLinkClick);

// Admin protected routes
router.get("/analytics", protect, getAnalytics);
router.get("/subscribers", protect, getSubscribers);
router.post("/subscribers/bulk-status", protect, bulkUpdateStatus);
router.post("/subscribers/bulk-delete", protect, bulkDelete);
router.patch("/subscribers/:id/status", protect, updateSubscriberStatus);
router.delete("/subscribers/:id", protect, deleteSubscriber);
router.get("/export", protect, exportSubscribersCsv);

export default router;
