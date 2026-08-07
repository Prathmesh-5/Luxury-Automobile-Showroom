/**
 * @swagger
 * tags:
 *   name: Cars
 *   description: Car Management APIs
 */

import express from "express";
import { carValidation } from "../validators/carValidator.js";
import validationMiddleware from "../middleware/validationMiddleware.js";

import { protect } from "../middleware/authMiddleware.js";

import {
    createCar,
    getAllCars,
    getCarById,
    updateCar,
    deleteCar,
    getSimilarCars
} from "../controllers/carController.js";

const router = express.Router();

/**
 * @swagger
 * /api/cars:
 *   post:
 *     summary: Create a new car
 *     tags: [Cars]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - brand
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *                 example: BMW X5
 *               brand:
 *                 type: string
 *                 example: BMW
 *               price:
 *                 type: number
 *                 example: 9500000
 *     responses:
 *       201:
 *         description: Car created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post(
    "/",
    protect,
    carValidation,
    validationMiddleware,
    createCar
);

/**
 * @swagger
 * /api/cars:
 *   get:
 *     summary: Get all cars
 *     tags: [Cars]
 *     responses:
 *       200:
 *         description: List of all cars
 */
router.get("/", getAllCars);

/**
 * @swagger
 * /api/cars/{id}/similar:
 *   get:
 *     summary: Get similar cars
 *     tags: [Cars]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Similar cars fetched successfully
 *       404:
 *         description: Car not found
 */
router.get("/:id/similar", getSimilarCars);

/**
 * @swagger
 * /api/cars/{id}:
 *   get:
 *     summary: Get car by ID
 *     tags: [Cars]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Car found
 *       404:
 *         description: Car not found
 */
router.get("/:id", getCarById);

/**
 * @swagger
 * /api/cars/{id}:
 *   put:
 *     summary: Update a car
 *     tags: [Cars]
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
 *         description: Car updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Car not found
 */
router.put(
    "/:id",
    protect,
    carValidation,
    validationMiddleware,
    updateCar
);

/**
 * @swagger
 * /api/cars/{id}:
 *   delete:
 *     summary: Delete a car
 *     tags: [Cars]
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
 *         description: Car deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Car not found
 */
router.delete("/:id", protect, deleteCar);

export default router;


