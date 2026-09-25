import { body } from "express-validator";

export const registerAdminValidation = [

    body("name")
        .trim()
        .notEmpty()
        .withMessage("Name is required"),

    body("email")
        .isEmail()
        .withMessage("Valid email is required"),

    body("password")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters")

];

export const loginAdminValidation = [

    body("email")
        .isEmail()
        .withMessage("Valid email is required"),

    body("password")
        .notEmpty()
        .withMessage("Password is required")

];

export const forgotPasswordValidation = [
    body("email")
        .trim()
        .isEmail()
        .withMessage("Valid email is required")
];

export const resetPasswordValidation = [
    body("password")
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters")
        .matches(/[A-Z]/)
        .withMessage("Password must contain at least one uppercase letter")
        .matches(/[a-z]/)
        .withMessage("Password must contain at least one lowercase letter")
        .matches(/[0-9]/)
        .withMessage("Password must contain at least one number")
        .matches(/[!@#$%^&*(),.?":{}|<>_\-+=]/)
        .withMessage("Password must contain at least one special character")
];

export const updateProfileValidation = [
    body("name")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Name cannot be empty"),
    body("profileImage")
        .optional()
        .trim()
];

export const updateEmailValidation = [
    body("currentPassword")
        .notEmpty()
        .withMessage("Current password is required"),
    body("newEmail")
        .trim()
        .isEmail()
        .withMessage("Valid email is required")
];

export const updatePasswordValidation = [
    body("currentPassword")
        .notEmpty()
        .withMessage("Current password is required"),
    body("newPassword")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters"),
    body("confirmPassword")
        .custom((value, { req }) => {
            if (value !== req.body.newPassword) {
                throw new Error("New password and confirmation must match");
            }
            return true;
        })
];