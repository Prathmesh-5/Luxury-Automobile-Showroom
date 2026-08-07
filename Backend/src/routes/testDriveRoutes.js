/**
 * @swagger
 * tags:
 *   name: Test Drives
 *   description: Test Drive Booking APIs
 */

import express from "express";
import { testDriveValidation } from "../validators/testDriveValidator.js";
import validationMiddleware from "../middleware/validationMiddleware.js";

import { protect } from "../middleware/authMiddleware.js";
import {
    createTestDrive,
    getAllTestDrives,
    updateTestDriveStatus
} from "../controllers/testDriveController.js";

const router = express.Router();

/**
 * @swagger
 * /api/test-drives:
 *   post:
 *     summary: Book a test drive
 *     tags: [Test Drives]
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
 *               preferredDate:
 *                 type: string
 *                 format: date
 *                 example: "2026-08-10"
 *               preferredTime:
 *                 type: string
 *                 example: "11:00 AM"
 *     responses:
 *       201:
 *         description: Test drive booked successfully
 */
router.post(
    "/",
    testDriveValidation,
    validationMiddleware,
    createTestDrive
);

/**
 * @swagger
 * /api/test-drives:
 *   get:
 *     summary: Get all test drive bookings
 *     tags: [Test Drives]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all test drive bookings
 */
router.get("/", protect, getAllTestDrives);

/**
 * @swagger
 * /api/test-drives/{id}:
 *   put:
 *     summary: Update test drive status
 *     tags: [Test Drives]
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
 *                 example: Confirmed
 *     responses:
 *       200:
 *         description: Test drive updated successfully
 *       404:
 *         description: Test drive not found
 */
router.put("/:id", protect, updateTestDriveStatus);

export default router;