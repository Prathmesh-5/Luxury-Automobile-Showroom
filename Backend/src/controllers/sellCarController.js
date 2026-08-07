import SellCar from "../models/SellCar.js";
import asyncHandler from "../middleware/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/apiResponse.js";

// Create Sell Request
export const createSellRequest = asyncHandler(async (req, res) => {
    const { name, email, phone, carBrand, carModel, carYear, mileage, condition, price, message, images } = req.body;

    if (!name || !email || !phone || !carBrand || !carModel || !carYear || !mileage || !condition || !price) {
        throw new ApiError(400, "All required vehicle and customer fields must be provided.");
    }

    const sellRequest = await SellCar.create({
        name,
        email,
        phone,
        carBrand,
        carModel,
        carYear,
        mileage,
        condition,
        price,
        message: message || "",
        images: images || [],
        status: "New"
    });

    res.status(201).json(
        new ApiResponse(201, true, "Vehicle submission received successfully", sellRequest)
    );
});

// Get All Sell Requests (Admin Only)
export const getAllSellRequests = asyncHandler(async (req, res) => {
    const requests = await SellCar.find().sort("-createdAt");
    res.status(200).json(
        new ApiResponse(200, true, "Sell requests retrieved successfully", {
            count: requests.length,
            requests
        })
    );
});

// Update Status (Admin Only)
export const updateSellRequestStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    if (!["New", "Contacted", "Closed"].includes(status)) {
        throw new ApiError(400, "Invalid status type.");
    }

    const sellRequest = await SellCar.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true, runValidators: true }
    );

    if (!sellRequest) {
        throw new ApiError(404, "Sell request not found.");
    }

    res.status(200).json(
        new ApiResponse(200, true, "Submission status updated successfully", sellRequest)
    );
});
