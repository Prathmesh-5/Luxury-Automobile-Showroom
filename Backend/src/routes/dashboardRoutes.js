/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Dashboard Statistics APIs
 */

import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getDashboardStats } from "../controllers/dashboardController.js";

const router = express.Router();

/**
 * @swagger
 * /api/dashboard:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics fetched successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/", protect, getDashboardStats);

export default router;