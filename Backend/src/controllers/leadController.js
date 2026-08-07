import Lead from "../models/Lead.js";
import asyncHandler from "../middleware/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/apiResponse.js";

export const createLead = asyncHandler(async (req, res) => {

        const lead = await Lead.create(req.body);

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

        const leads = await Lead.find()
            .populate("carId", "name model price")
            .sort("-createdAt");

        res.status(200).json(
            new ApiResponse(
                200,
                true,
                "Leads fetched successfully",
                {
                    count: leads.length,
                    leads
                }
            )
        );

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