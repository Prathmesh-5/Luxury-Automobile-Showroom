import { body } from "express-validator";

export const leadValidation = [

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

    body("carId")
        .optional({ nullable: true, checkFalsy: true })
        .isMongoId()
        .withMessage("Car ID must be a valid Mongo ID")

];