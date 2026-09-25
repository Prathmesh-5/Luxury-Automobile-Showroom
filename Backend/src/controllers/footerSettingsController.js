import FooterSettings from "../models/FooterSettings.js";
import asyncHandler from "../middleware/asyncHandler.js";
import ApiResponse from "../utils/apiResponse.js";

// @desc    Get Footer Settings (Public / Admin)
// @route   GET /api/footer-settings
// @access  Public
export const getFooterSettings = asyncHandler(async (req, res) => {
    let settings = await FooterSettings.findOne();
    if (!settings) {
        settings = await FooterSettings.create({});
    }

    res.status(200).json(
        new ApiResponse(200, true, "Footer settings fetched successfully", settings)
    );
});

// @desc    Update Footer Settings (Admin Only)
// @route   PUT /api/footer-settings
// @access  Private/Admin
export const updateFooterSettings = asyncHandler(async (req, res) => {
    let settings = await FooterSettings.findOne();
    if (!settings) {
        settings = new FooterSettings();
    }

    const {
        logoUrl,
        description,
        quickLinks,
        address,
        phone,
        email,
        businessHours,
        socialLinks,
        newsletterHeading,
        newsletterDescription,
        newsletterPlaceholder,
        newsletterButtonText,
        carImageUrl,
        carImageAlt,
        copyrightText,
        autoCurrentYear,
        showLogo,
        showDescription,
        showSocialLinks,
        showQuickLinks,
        showShowroomInfo,
        showNewsletter,
        showCarImage,
        showCopyright
    } = req.body;

    if (logoUrl !== undefined) settings.logoUrl = logoUrl;
    if (description !== undefined) settings.description = description;
    if (quickLinks !== undefined) settings.quickLinks = quickLinks;
    if (address !== undefined) settings.address = address;
    if (phone !== undefined) settings.phone = phone;
    if (email !== undefined) settings.email = email;
    if (businessHours !== undefined) settings.businessHours = businessHours;
    if (socialLinks !== undefined) settings.socialLinks = socialLinks;
    if (newsletterHeading !== undefined) settings.newsletterHeading = newsletterHeading;
    if (newsletterDescription !== undefined) settings.newsletterDescription = newsletterDescription;
    if (newsletterPlaceholder !== undefined) settings.newsletterPlaceholder = newsletterPlaceholder;
    if (newsletterButtonText !== undefined) settings.newsletterButtonText = newsletterButtonText;
    if (carImageUrl !== undefined) settings.carImageUrl = carImageUrl;
    if (carImageAlt !== undefined) settings.carImageAlt = carImageAlt;
    if (copyrightText !== undefined) settings.copyrightText = copyrightText;
    if (autoCurrentYear !== undefined) settings.autoCurrentYear = Boolean(autoCurrentYear);

    if (showLogo !== undefined) settings.showLogo = Boolean(showLogo);
    if (showDescription !== undefined) settings.showDescription = Boolean(showDescription);
    if (showSocialLinks !== undefined) settings.showSocialLinks = Boolean(showSocialLinks);
    if (showQuickLinks !== undefined) settings.showQuickLinks = Boolean(showQuickLinks);
    if (showShowroomInfo !== undefined) settings.showShowroomInfo = Boolean(showShowroomInfo);
    if (showNewsletter !== undefined) settings.showNewsletter = Boolean(showNewsletter);
    if (showCarImage !== undefined) settings.showCarImage = Boolean(showCarImage);
    if (showCopyright !== undefined) settings.showCopyright = Boolean(showCopyright);

    await settings.save();

    res.status(200).json(
        new ApiResponse(200, true, "Footer settings updated successfully", settings)
    );
});

// @desc    Reset Footer Settings to Default Production Values
// @route   POST /api/footer-settings/reset
// @access  Private/Admin
export const resetFooterSettings = asyncHandler(async (req, res) => {
    await FooterSettings.deleteMany({});
    const defaultSettings = await FooterSettings.create({});

    res.status(200).json(
        new ApiResponse(200, true, "Footer settings reset to default values", defaultSettings)
    );
});
