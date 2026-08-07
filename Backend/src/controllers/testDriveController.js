import TestDrive from "../models/TestDrive.js";
import asyncHandler from "../middleware/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/apiResponse.js";

export const createTestDrive = asyncHandler(async (req, res) => {

        const booking = await TestDrive.create(req.body);

        res.status(201).json(
    new ApiResponse(
        201,
        true,
        "Test Drive Booked Successfully",
        booking
    )
);

    
});

export const getAllTestDrives = asyncHandler(async (req, res) => {

        const bookings = await TestDrive.find()
            .populate("carId", "name model price")
            .sort("-createdAt");

        res.status(200).json(
    new ApiResponse(
        200,
        true,
        "Test Drives fetched successfully",
        {
            count: bookings.length,
            bookings
        }
    )
);

    
});

export const updateTestDriveStatus = asyncHandler(async (req, res) => {

        const booking = await TestDrive.findByIdAndUpdate(
            req.params.id,
            {
                status: req.body.status
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!booking) {
            throw new ApiError(
                404,
                "Booking Not Found"
            );
        }

        res.status(200).json(
    new ApiResponse(
        200,
        true,
        "Test Drive status updated successfully",
        booking
    )
);

   
});