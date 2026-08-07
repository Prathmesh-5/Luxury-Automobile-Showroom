import { body } from "express-validator";

export const brandValidation = [
    body("name")
        .trim()
        .notEmpty()
        .withMessage("Brand name is required"),

    body("country")
        .trim()
        .notEmpty()
        .withMessage("Country is required"),

    body("logo")
        .trim()
        .notEmpty()
        .withMessage("Logo URL is required"),

    body("description")
        .trim()
        .notEmpty()
        .withMessage("Description is required"),

    body("heroCar")
        .optional()
        .trim(),

    body("foundedYear")
        .optional()
        .trim(),

    body("overview")
        .optional()
        .trim(),

    body("whyChoose")
        .optional()
        .isArray(),

    body("popularModels")
        .optional()
        .isArray(),

    body("performance")
        .optional()
        .isObject(),

    body("performance.speed")
        .optional()
        .trim(),

    body("performance.zero")
        .optional()
        .trim(),

    body("performance.hp")
        .optional()
        .trim(),

    body("performance.engine")
        .optional()
        .trim(),

    body("isActive")
        .optional()
        .isBoolean()
];