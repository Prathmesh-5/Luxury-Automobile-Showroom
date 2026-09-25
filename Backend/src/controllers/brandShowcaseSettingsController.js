import BrandShowcaseSettings from "../models/BrandShowcaseSettings.js";
import asyncHandler from "../middleware/asyncHandler.js";
import ApiResponse from "../utils/apiResponse.js";

// @desc    Get Brand Showcase Settings (Public / Admin)
// @route   GET /api/brand-showcase-settings
// @access  Public
export const getBrandShowcaseSettings = asyncHandler(async (req, res) => {
    let settings = await BrandShowcaseSettings.findOne();
    if (!settings) {
        settings = await BrandShowcaseSettings.create({});
    }

    res.status(200).json(
        new ApiResponse(200, true, "Brand showcase settings fetched successfully", settings)
    );
});

// @desc    Update Brand Showcase Settings (Admin Only)
// @route   PUT /api/brand-showcase-settings
// @access  Private/Admin
export const updateBrandShowcaseSettings = asyncHandler(async (req, res) => {
    let settings = await BrandShowcaseSettings.findOne();
    if (!settings) {
        settings = new BrandShowcaseSettings();
    }

    const { smallHeading, mainHeading, showSection } = req.body;

    if (smallHeading !== undefined) settings.smallHeading = smallHeading;
    if (mainHeading !== undefined) settings.mainHeading = mainHeading;
    if (showSection !== undefined) settings.showSection = Boolean(showSection);

    await settings.save();

    res.status(200).json(
        new ApiResponse(200, true, "Brand showcase settings updated successfully", settings)
    );
});
