/**
 * @swagger
 * tags:
 *   name: Leads
 *   description: Lead Management APIs
 */

import express from "express";
import { leadValidation } from "../validators/leadValidator.js";
import validationMiddleware from "../middleware/validationMiddleware.js";

import { protect } from "../middleware/authMiddleware.js";
import {
    createLead,
    getAllLeads,
    updateLeadStatus,
    deleteLead
} from "../controllers/leadController.js";

const router = express.Router();

/**
 * @swagger
 * /api/leads:
 *   post:
 *     summary: Create a new lead
 *     tags: [Leads]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               carId:
 *                 type: string
 *                 example: 66abc123456789abcdef1234
 *               name:
 *                 type: string
 *                 example: Rahul Sharma
 *               email:
 *                 type: string
 *                 example: rahul@gmail.com
 *               phone:
 *                 type: string
 *                 example: "9876543210"
 *               message:
 *                 type: string
 *                 example: Interested in this car
 *     responses:
 *       201:
 *         description: Lead created successfully
 */
router.post(
    "/",
    leadValidation,
    validationMiddleware,
    createLead
);

/**
 * @swagger
 * /api/leads:
 *   get:
 *     summary: Get all leads
 *     tags: [Leads]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all leads
 */
router.get("/", protect, getAllLeads);

/**
 * @swagger
 * /api/leads/{id}:
 *   put:
 *     summary: Update lead status
 *     tags: [Leads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 example: Contacted
 *     responses:
 *       200:
 *         description: Lead updated successfully
 *       404:
 *         description: Lead not found
 */
router.put("/:id", protect, updateLeadStatus);

/**
 * @swagger
 * /api/leads/{id}:
 *   delete:
 *     summary: Delete a lead
 *     tags: [Leads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lead deleted successfully
 *       404:
 *         description: Lead not found
 */
router.delete("/:id", protect, deleteLead);

export default router;

