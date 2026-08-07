import { body } from "express-validator";

export const testDriveValidation = [

    body("carId")
        .notEmpty()
        .withMessage("Car ID is required"),

    body("name")
        .trim()
        .notEmpty()
        .withMessage("Name is required"),

    body("email")
        .isEmail()
        .withMessage("Valid email is required"),

    body("phone")
        .trim()
        .notEmpty()
        .withMessage("Phone number is required"),

    body("preferredDate")
        .notEmpty()
        .withMessage("Preferred date is required")
        .isISO8601()
        .withMessage("Enter a valid date"),

    body("preferredTime")
        .trim()
        .notEmpty()
        .withMessage("Preferred time is required")

];