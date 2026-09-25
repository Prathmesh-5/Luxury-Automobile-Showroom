import bcrypt from "bcryptjs";
import Admin from "../models/Admin.js";
import jwt from "jsonwebtoken";
import asyncHandler from "../middleware/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/apiResponse.js";
import crypto from "crypto";
import { sendResetEmail } from "../services/mailService.js";

export const registerAdmin = asyncHandler(async (req, res) => {

    const { name, email, password } = req.body;

    const existingAdmin = await Admin.findOne({ email });

    if (existingAdmin) {
        throw new ApiError(
            400,
            "Admin already exists"
        );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await Admin.create({
        name,
        email,
        password: hashedPassword
    });

    res.status(201).json(
        new ApiResponse(
            201,
            true,
            "Admin Registered Successfully",
            admin
        )
    );

});

export const loginAdmin = asyncHandler(async (req, res) => {
    

        const { email, password } = req.body;

        const admin = await Admin.findOne({ email });

        if (!admin) {
            throw new ApiError(
                401,
                "Invalid Email or Password"
            );
        }

        const isMatch = await bcrypt.compare(password, admin.password);

        if (!isMatch) {
            throw new ApiError(
                401,
                "Invalid Email or Password"
            );
        }

        const token = jwt.sign(
            { id: admin._id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.status(200).json(
            new ApiResponse(
                200,
                true,
                "Login Successful",
                {
                    token,
                    admin: {
                        id: admin._id,
                        name: admin.name,
                        email: admin.email,
                        profileImage: admin.profileImage || admin.avatar || "",
                        avatar: admin.avatar || admin.profileImage || ""
                    }
                }
            )
        );

});

export const getAdminProfile = asyncHandler(async (req, res) => {
    const admin = await Admin.findById(req.admin._id).select("-password");
    if (!admin) {
        throw new ApiError(404, "Admin not found");
    }
    res.status(200).json(
        new ApiResponse(
            200,
            true,
            "Admin profile fetched successfully",
            {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                profileImage: admin.profileImage || admin.avatar || "",
                avatar: admin.avatar || admin.profileImage || ""
            }
        )
    );
});

export const updateAdminProfile = asyncHandler(async (req, res) => {
    const admin = await Admin.findById(req.admin._id);
    if (!admin) {
        throw new ApiError(404, "Admin not found");
    }

    if (req.body.name !== undefined) {
        admin.name = req.body.name.trim();
    }

    if (req.body.profileImage !== undefined) {
        admin.profileImage = req.body.profileImage;
        admin.avatar = req.body.profileImage;
    } else if (req.body.avatar !== undefined) {
        admin.profileImage = req.body.avatar;
        admin.avatar = req.body.avatar;
    }

    await admin.save();

    res.status(200).json(
        new ApiResponse(
            200,
            true,
            "Profile updated successfully.",
            {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                profileImage: admin.profileImage || admin.avatar || "",
                avatar: admin.avatar || admin.profileImage || ""
            }
        )
    );
});

export const updateAdminEmail = asyncHandler(async (req, res) => {
    const { currentPassword, newEmail } = req.body;

    if (!currentPassword) {
        throw new ApiError(400, "Current password is required.");
    }
    if (!newEmail) {
        throw new ApiError(400, "New email is required.");
    }

    const admin = await Admin.findById(req.admin._id);
    if (!admin) {
        throw new ApiError(404, "Admin not found");
    }

    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) {
        throw new ApiError(400, "Current password is incorrect.");
    }

    const cleanEmail = newEmail.toLowerCase().trim();

    const existingAdmin = await Admin.findOne({
        email: cleanEmail,
        _id: { $ne: admin._id }
    });

    if (existingAdmin) {
        throw new ApiError(400, "Email address is already in use.");
    }

    admin.email = cleanEmail;
    await admin.save();

    res.status(200).json(
        new ApiResponse(
            200,
            true,
            "Email updated successfully.",
            {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                profileImage: admin.profileImage || admin.avatar || "",
                avatar: admin.avatar || admin.profileImage || ""
            }
        )
    );
});

export const updateAdminPassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword) {
        throw new ApiError(400, "Current password is required.");
    }
    if (!newPassword || !confirmPassword) {
        throw new ApiError(400, "New password and confirmation are required.");
    }
    if (newPassword !== confirmPassword) {
        throw new ApiError(400, "New password and confirmation must match.");
    }
    if (newPassword.length < 6) {
        throw new ApiError(400, "Password must be at least 6 characters.");
    }

    const admin = await Admin.findById(req.admin._id);
    if (!admin) {
        throw new ApiError(404, "Admin not found");
    }

    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) {
        throw new ApiError(400, "Current password is incorrect.");
    }

    admin.password = await bcrypt.hash(newPassword, 10);
    await admin.save();

    res.status(200).json(
        new ApiResponse(
            200,
            true,
            "Password changed successfully."
        )
    );
});

export const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    
    // 1. Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.toLowerCase().trim())) {
        throw new ApiError(400, "Please provide a valid email address.");
    }

    const targetEmail = email.toLowerCase().trim();
    const admin = await Admin.findOne({ email: targetEmail });

    // Generic success message to prevent user enumeration
    const genericSuccessMessage = "If an account exists with this email, a password reset link has been sent.";

    if (!admin) {
        // 3. Mitigate timing attacks by performing a dummy bcrypt hash operation
        // This makes response times for invalid emails match the time spent on valid emails
        await bcrypt.hash("dummy_prevent_timing_attack_string", 10);
        
        return res.status(200).json(
            new ApiResponse(200, true, genericSuccessMessage)
        );
    }

    // 4. Generate secure token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    admin.resetPasswordToken = hashedToken;
    admin.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
    await admin.save();

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const resetUrl = `${frontendUrl}/admin/reset-password?token=${resetToken}`;

    const mailSent = await sendResetEmail(admin.email, resetUrl);
    
    if (!mailSent) {
        throw new ApiError(500, "Failed to send password reset email. Please check SMTP configuration.");
    }

    res.status(200).json(
        new ApiResponse(200, true, genericSuccessMessage)
    );
});

export const resetPassword = asyncHandler(async (req, res) => {
    const token = req.query.token || req.body.token;
    const { password } = req.body;

    if (!token) {
        throw new ApiError(400, "Reset token is required.");
    }
    if (!password) {
        throw new ApiError(400, "New password is required.");
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const admin = await Admin.findOne({ resetPasswordToken: hashedToken });

    if (!admin) {
        throw new ApiError(400, "Invalid password reset link.");
    }

    if (admin.resetPasswordExpires < Date.now()) {
        throw new ApiError(400, "This reset link has expired.");
    }

    // Hash new password using bcrypt (10 rounds)
    admin.password = await bcrypt.hash(password, 10);
    admin.resetPasswordToken = undefined;
    admin.resetPasswordExpires = undefined;
    await admin.save();

    res.status(200).json(
        new ApiResponse(
            200,
            true,
            "Password updated successfully."
        )
    );
});

export const validateResetToken = asyncHandler(async (req, res) => {
    const { token } = req.query;

    if (!token) {
        throw new ApiError(400, "Reset token is required.");
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const admin = await Admin.findOne({ resetPasswordToken: hashedToken });

    if (!admin) {
        throw new ApiError(400, "Invalid password reset link.");
    }

    if (admin.resetPasswordExpires < Date.now()) {
        throw new ApiError(400, "This reset link has expired.");
    }

    res.status(200).json(
        new ApiResponse(200, true, "Token is valid.")
    );
});