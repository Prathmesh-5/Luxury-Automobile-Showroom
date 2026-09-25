import Lead from "../models/Lead.js";
import Car from "../models/Car.js";
import asyncHandler from "../middleware/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/apiResponse.js";

export const createLead = asyncHandler(async (req, res) => {
    let { carId, name, email, phone, message, status } = req.body;

    if (!carId || carId === "null" || carId === "undefined" || carId.toString().trim() === "") {
        carId = null;
    }

    const lead = await Lead.create({
        carId,
        name,
        email,
        phone,
        message,
        status: status || "New"
    });

    res.status(201).json(
        new ApiResponse(
            201,
            true,
            "Lead Created Successfully",
            lead
        )
    );
});

export const getAllLeads = asyncHandler(async (req, res) => {
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
            { message: searchRegex },
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
        }
        if (startDate) {
            query.createdAt = { $gte: startDate };
        }
    }

    // Determine sorting
    const sortDirection = sort === "asc" ? 1 : -1;

    // Fetch leads matching query
    const leads = await Lead.find(query)
        .populate("carId", "name model price")
        .sort({ createdAt: sortDirection, _id: sortDirection })
        .skip(skip)
        .limit(limit);

    // Calculate count query (ignore status filter)
    const countQuery = { ...query };
    delete countQuery.status;

    // Run parallel counts
    const [totalCounts, newCounts, contactedCounts, closedCounts, matchingTotal] = await Promise.all([
        Lead.countDocuments(countQuery),
        Lead.countDocuments({ ...countQuery, status: "New" }),
        Lead.countDocuments({ ...countQuery, status: "Contacted" }),
        Lead.countDocuments({ ...countQuery, status: "Closed" }),
        Lead.countDocuments(query) // total matching the current filters (with status) for pagination
    ]);

    const totalPages = Math.ceil(matchingTotal / limit);

    res.status(200).json({
        statusCode: 200,
        success: true,
        message: "Leads fetched successfully",
        data: leads,
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

export const updateLeadStatus = asyncHandler(async (req, res) => {

        const lead = await Lead.findByIdAndUpdate(
            req.params.id,
            {
                status: req.body.status
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!lead) {
            throw new ApiError(
                404,
                "Lead Not Found"
            );
        }

        res.status(200).json(
            new ApiResponse(
                200,
                true,
                "Lead status updated successfully",
                lead
            )
        );

    
});

export const deleteLead = asyncHandler(async (req, res) => {
    const lead = await Lead.findByIdAndDelete(req.params.id);

    if (!lead) {
        throw new ApiError(
            404,
            "Lead Not Found"
        );
    }

    res.status(200).json(
        new ApiResponse(
            200,
            true,
            "Lead deleted successfully",
            null
        )
    );
});