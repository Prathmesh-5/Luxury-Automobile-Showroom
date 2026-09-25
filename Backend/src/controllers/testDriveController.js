import TestDrive from "../models/TestDrive.js";
import Car from "../models/Car.js";
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
        // Pre-query Car collection to get ID matches
        const matchingCars = await Car.find({
            $or: [
                { name: searchRegex },
                { model: searchRegex }
            ]
        }).select("_id");
        const carIds = matchingCars.map(c => c._id);

        query.$or = [
            { name: searchRegex },
            { email: searchRegex },
            { phone: searchRegex },
            { preferredTime: searchRegex },
            { carId: { $in: carIds } }
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
        } else if (dateRange === "This Month") {
            startDate = new Date();
            startDate.setDate(1);
            startDate.setHours(0, 0, 0, 0);
        }
        if (startDate) {
            query.createdAt = { $gte: startDate };
        }
    }

    // Determine sorting
    const sortDirection = sort === "asc" ? 1 : -1;

    // Fetch test drive bookings matching query
    const bookings = await TestDrive.find(query)
        .populate("carId", "name model price")
        .sort({ createdAt: sortDirection, _id: sortDirection })
        .skip(skip)
        .limit(limit);

    // Calculate count query (ignore status filter)
    const countQuery = { ...query };
    delete countQuery.status;

    // Run parallel counts
    const [totalCounts, pendingCounts, confirmedCounts, completedCounts, cancelledCounts, matchingTotal] = await Promise.all([
        TestDrive.countDocuments(countQuery),
        TestDrive.countDocuments({ ...countQuery, status: "Pending" }),
        TestDrive.countDocuments({ ...countQuery, status: "Confirmed" }),
        TestDrive.countDocuments({ ...countQuery, status: "Completed" }),
        TestDrive.countDocuments({ ...countQuery, status: "Cancelled" }),
        TestDrive.countDocuments(query) // total matching the current filters (with status) for pagination
    ]);

    const totalPages = Math.ceil(matchingTotal / limit);

    res.status(200).json({
        statusCode: 200,
        success: true,
        message: "Test Drives fetched successfully",
        data: bookings,
        pagination: {
            page,
            limit,
            total: matchingTotal,
            totalPages: totalPages || 1
        },
        counts: {
            total: totalCounts,
            pending: pendingCounts,
            confirmed: confirmedCounts,
            completed: completedCounts,
            cancelled: cancelledCounts
        }
    });
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

export const deleteTestDrive = asyncHandler(async (req, res) => {
    const booking = await TestDrive.findByIdAndDelete(req.params.id);

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
            "Booking deleted successfully",
            null
        )
    );
});