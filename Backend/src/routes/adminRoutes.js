/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin Authentication APIs
 */

import express from "express";
import rateLimit from "express-rate-limit";
import {
    registerAdminValidation,
    loginAdminValidation,
    forgotPasswordValidation,
    resetPasswordValidation
} from "../validators/adminValidator.js";

import validationMiddleware from "../middleware/validationMiddleware.js";
import {
    registerAdmin,
    loginAdmin,
    getAdminProfile,
    forgotPassword,
    resetPassword,
    validateResetToken
} from "../controllers/adminController.js";

import { protect } from "../middleware/authMiddleware.js";

const forgotPasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per 15 minutes
    message: {
        success: false,
        message: "Too many password reset requests from this IP, please try again after 15 minutes."
    },
    standardHeaders: true,
    legacyHeaders: false
});

const router = express.Router();

/**
 * @swagger
 * /api/admin/register:
 *   post:
 *     summary: Register a new admin
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Prathmesh Chauhan
 *               email:
 *                 type: string
 *                 example: admin@gmail.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       201:
 *         description: Admin registered successfully
 */
router.post(
    "/register",
    registerAdminValidation,
    validationMiddleware,
    registerAdmin
);

/**
 * @swagger
 * /api/admin/login:
 *   post:
 *     summary: Login admin
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@gmail.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid email or password
 */
router.post(
    "/login",
    loginAdminValidation,
    validationMiddleware,
    loginAdmin
);

/**
 * @swagger
 * /api/admin/profile:
 *   get:
 *     summary: Get admin profile
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin profile fetched successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/profile", protect, getAdminProfile);

/**
 * @swagger
 * /api/admin/forgot-password:
 *   post:
 *     summary: Request password reset link
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@gmail.com
 *     responses:
 *       200:
 *         description: Reset link sent successfully
 *       404:
 *         description: No administrator account found with this email
 */
router.post(
    "/forgot-password",
    forgotPasswordLimiter,
    forgotPasswordValidation,
    validationMiddleware,
    forgotPassword
);

/**
 * @swagger
 * /api/admin/reset-password:
 *   get:
 *     summary: Verify reset token validity and expiry
 *     tags: [Admin]
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *             type: string
 *     responses:
 *       200:
 *         description: Token is valid
 *       400:
 *         description: Invalid or expired token
 */
router.get(
    "/reset-password",
    validateResetToken
);

/**
 * @swagger
 * /api/admin/reset-password:
 *   post:
 *     summary: Reset password using secure token
 *     tags: [Admin]
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *             type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *                 example: NewSecurePassword123!
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       400:
 *         description: Invalid or expired token
 */
router.post(
    "/reset-password",
    resetPasswordValidation,
    validationMiddleware,
    resetPassword
);

export default router;