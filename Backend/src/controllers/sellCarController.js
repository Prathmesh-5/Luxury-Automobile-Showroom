import fs from "fs";
import path from "path";
import SellCar from "../models/SellCar.js";
import Car from "../models/Car.js";
import Brand from "../models/Brand.js";
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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const { status, search, sort, dateRange } = req.query;

    let query = {};

    // 1. Status filter
    if (status && status !== "All") {
        query.status = status;
    }

    // 2. Search filter
    if (search) {
        const searchRegex = new RegExp(search, "i");
        query.$or = [
            { name: searchRegex },
            { email: searchRegex },
            { phone: searchRegex },
            { carBrand: searchRegex },
            { carModel: searchRegex },
            { message: searchRegex }
        ];
    }

    // 3. Date range filter
    if (dateRange && dateRange !== "All Time") {
        const now = new Date();
        let startDate;
        if (dateRange === "Today") {
            startDate = new Date();
            startDate.setHours(0, 0, 0, 0);
        } else if (dateRange === "Last 7 Days") {
            startDate = new Date();
            startDate.setDate(now.getDate() - 7);
        } else if (dateRange === "Last 30 Days") {
            startDate = new Date();
            startDate.setDate(now.getDate() - 30);
        }
        if (startDate) {
            query.createdAt = { $gte: startDate };
        }
    }

    // Determine sorting
    const sortDirection = sort === "asc" ? 1 : -1;

    // Fetch requests matching query
    const requests = await SellCar.find(query)
        .sort({ createdAt: sortDirection, _id: sortDirection })
        .skip(skip)
        .limit(limit);

    // Calculate count query (ignore status filter)
    const countQuery = { ...query };
    delete countQuery.status;

    // Run parallel counts
    const [totalCounts, newCounts, contactedCounts, closedCounts, matchingTotal] = await Promise.all([
        SellCar.countDocuments(countQuery),
        SellCar.countDocuments({ ...countQuery, status: "New" }),
        SellCar.countDocuments({ ...countQuery, status: "Contacted" }),
        SellCar.countDocuments({ ...countQuery, status: "Closed" }),
        SellCar.countDocuments(query) // total matching current filters (with status)
    ]);

    const totalPages = Math.ceil(matchingTotal / limit);

    res.status(200).json({
        statusCode: 200,
        success: true,
        message: "Sell requests fetched successfully",
        data: requests,
        pagination: {
            page,
            limit,
            total: matchingTotal,
            totalPages: totalPages || 1
        },
        counts: {
            total: totalCounts,
            new: newCounts,
            contacted: contactedCounts,
            closed: closedCounts
        }
    });
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

// Delete Sell Request (Admin Only)
export const deleteSellRequest = asyncHandler(async (req, res) => {
    const sellRequest = await SellCar.findById(req.params.id);

    if (!sellRequest) {
        throw new ApiError(404, "Sell request not found.");
    }

    // Capture associated images
    const imagesToCleanup = sellRequest.images || [];

    // Delete the SellCar record first
    await SellCar.findByIdAndDelete(req.params.id);

    // Clean up images safely only when they are no longer referenced anywhere else
    for (const imgUrl of imagesToCleanup) {
        if (!imgUrl) continue;

        // Extract the exact filename to prevent path/URL mismatch issues
        const filename = path.basename(imgUrl);
        
        // Never delete pre-seeded/static assets (must match dynamic upload naming pattern)
        const isDynamicUpload = /^\d+-\d+\.[a-zA-Z0-9]+$/.test(filename);
        if (!isDynamicUpload) {
            console.log(`Skipping file cleanup for pre-seeded asset: ${filename}`);
            continue;
        }

        // Search references using regex for filename
        const filenameRegex = new RegExp(filename, "i");

        // 1. Check if referenced in other SellCar records
        const referencedInSellCar = await SellCar.exists({ images: filenameRegex });

        // 2. Check if referenced in any Car record
        const referencedInCar = await Car.exists({ images: filenameRegex });

        // 3. Check if referenced in any Brand record (logo or heroCar)
        const referencedInBrand = await Brand.exists({
            $or: [
                { logo: filenameRegex },
                { heroCar: filenameRegex }
            ]
        });

        // 4. Safe delete if completely unreferenced
        if (!referencedInSellCar && !referencedInCar && !referencedInBrand) {
            const filePath = path.join("uploads", filename);
            try {
                if (fs.existsSync(filePath)) {
                    await fs.promises.unlink(filePath);
                    console.log(`Successfully deleted unreferenced image: ${filePath}`);
                }
            } catch (err) {
                console.error(`Failed to delete unreferenced image file ${filePath}:`, err);
            }
        } else {
            console.log(`Image ${filename} is still referenced elsewhere. Skipping deletion.`);
        }
    }

    res.status(200).json(
        new ApiResponse(200, true, "Sell request and associated files deleted successfully", null)
    );
});
