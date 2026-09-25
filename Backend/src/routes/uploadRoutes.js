/**
 * @swagger
 * tags:
 *   name: Upload
 *   description: Image Upload APIs
 */

import express from "express";
import upload from "../middleware/uploadMiddleware.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/upload:
 *   post:
 *     summary: Upload an image
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *       401:
 *         description: Unauthorized
 */
router.post(
    "/",
    protect,
    upload.array("images", 10),
    (req, res) => {

        const imageUrls = req.files.map(
            file => `/uploads/${file.filename}`
        );

        res.status(200).json({
            success: true,
            message: "Images Uploaded Successfully",
            images: imageUrls
        });

    }
);

router.post(
    "/public-sell-car",
    upload.array("images", 10),
    (req, res) => {
        const imageUrls = req.files.map(
            file => `/uploads/${file.filename}`
        );

        res.status(200).json({
            success: true,
            message: "Images Uploaded Successfully",
            images: imageUrls
        });
    }
);

export default router;