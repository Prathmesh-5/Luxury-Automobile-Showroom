import express from "express";
import { getAllFaqs, createFaq, updateFaq, deleteFaq } from "../controllers/faqController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/")
    .get(getAllFaqs)
    .post(protect, createFaq);

router.route("/:id")
    .put(protect, updateFaq)
    .delete(protect, deleteFaq);

export default router;
