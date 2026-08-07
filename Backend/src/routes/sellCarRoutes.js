import express from "express";
import { createSellRequest, getAllSellRequests, updateSellRequestStatus } from "../controllers/sellCarController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/")
    .post(createSellRequest)
    .get(protect, getAllSellRequests);

router.route("/:id")
    .put(protect, updateSellRequestStatus);

export default router;
