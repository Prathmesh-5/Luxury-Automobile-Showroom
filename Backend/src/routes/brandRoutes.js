/**
 * @swagger
 * tags:
 *   name: Brands
 *   description: Brand Management APIs
 */

import express from "express";
import { brandValidation } from "../validators/brandValidator.js";
import validationMiddleware from "../middleware/validationMiddleware.js";

import { protect } from "../middleware/authMiddleware.js";
import {
    createBrand,
    getAllBrands,
    getBrandById,
    updateBrand,
    deleteBrand
} from "../controllers/brandController.js";

const router = express.Router();

/**
 * @swagger
 * /api/brands:
 *   post:
 *     summary: Create a new brand
 *     tags: [Brands]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: BMW
 *               slug:
 *                 type: string
 *                 example: bmw
 *               country:
 *                 type: string
 *                 example: Germany
 *               logo:
 *                 type: string
 *                 example: https://example.com/bmw.png
 *               description:
 *                 type: string
 *                 example: German luxury automobile manufacturer
 *     responses:
 *       201:
 *         description: Brand created successfully
 */

/**
 * @swagger
 * /api/brands:
 *   get:
 *     summary: Get all brands
 *     tags: [Brands]
 *     responses:
 *       200:
 *         description: List of all brands
 */
router
.route("/")
.post(
    protect,
    brandValidation,
    validationMiddleware,
    createBrand
)
.get(getAllBrands);


/**
 * @swagger
 * /api/brands/{id}:
 *   get:
 *     summary: Get brand by ID
 *     tags: [Brands]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Brand found
 *       404:
 *         description: Brand not found
 */

/**
 * @swagger
 * /api/brands/{id}:
 *   put:
 *     summary: Update brand
 *     tags: [Brands]
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
 *         description: Brand updated successfully
 */

/**
 * @swagger
 * /api/brands/{id}:
 *   delete:
 *     summary: Delete brand
 *     tags: [Brands]
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
 *         description: Brand deleted successfully
 */
router
.route("/:id")
.get(getBrandById)
.put(
    protect,
    brandValidation,
    validationMiddleware,
    updateBrand
)
.delete(protect, deleteBrand);

export default router;


