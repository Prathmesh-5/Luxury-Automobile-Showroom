import { body } from "express-validator";

export const carValidation = [

    body("name")
        .trim()
        .notEmpty()
        .withMessage("Car name is required"),

    body("model")
        .trim()
        .notEmpty()
        .withMessage("Model is required"),

    body("brandId")
        .notEmpty()
        .withMessage("Brand ID is required"),

    body("price")
        .isFloat({ min: 0 })
        .withMessage("Price must be greater than or equal to 0"),

    body("year")
        .isInt({ min: 1900, max: 2100 })
        .withMessage("Enter a valid year"),

    body("condition")
        .isIn(["New", "Used"])
        .withMessage("Condition must be New or Used"),

    body("featuredPriority")
        .optional({ nullable: true, checkFalsy: true })
        .customSanitizer(value => {
            if (value === undefined || value === null || value === "") {
                return 9999;
            }
            return Number(value);
        })
        .isInt({ min: 1 })
        .withMessage("Featured Priority must be at least 1")
];