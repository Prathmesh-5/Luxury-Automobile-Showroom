import HeroSettings from "../models/HeroSettings.js";
import asyncHandler from "../middleware/asyncHandler.js";
import ApiResponse from "../utils/apiResponse.js";

// Get Hero Settings (Public / Admin)
export const getHeroSettings = asyncHandler(async (req, res) => {
    let settings = await HeroSettings.findOne();
    if (!settings) {
        settings = await HeroSettings.create({});
    }

    res.status(200).json(
        new ApiResponse(200, true, "Hero settings fetched successfully", settings)
    );
});

// Update Hero Settings (Admin Only)
export const updateHeroSettings = asyncHandler(async (req, res) => {
    let settings = await HeroSettings.findOne();
    if (!settings) {
        settings = new HeroSettings();
    }

    const {
        smallBadgeText,
        mainTitle,
        highlightTitle,
        descriptionText,
        topRightBadgeText,
        mediaType,
        desktopHeroImage,
        mobileHeroImage,
        heroVideo,
        exploreBtnText,
        exploreBtnLink,
        bookBtnText,
        bookBtnLink,
        logoUrl,
        overlayDarkness,
        establishedYear
    } = req.body;

    if (smallBadgeText !== undefined) settings.smallBadgeText = smallBadgeText;
    if (mainTitle !== undefined) settings.mainTitle = mainTitle;
    if (highlightTitle !== undefined) settings.highlightTitle = highlightTitle;
    if (descriptionText !== undefined) settings.descriptionText = descriptionText;
    if (topRightBadgeText !== undefined) settings.topRightBadgeText = topRightBadgeText;
    if (mediaType !== undefined) settings.mediaType = mediaType;
    if (desktopHeroImage !== undefined) settings.desktopHeroImage = desktopHeroImage;
    if (mobileHeroImage !== undefined) settings.mobileHeroImage = mobileHeroImage;
    if (heroVideo !== undefined) settings.heroVideo = heroVideo;
    if (exploreBtnText !== undefined) settings.exploreBtnText = exploreBtnText;
    if (exploreBtnLink !== undefined) settings.exploreBtnLink = exploreBtnLink;
    if (bookBtnText !== undefined) settings.bookBtnText = bookBtnText;
    if (bookBtnLink !== undefined) settings.bookBtnLink = bookBtnLink;
    if (logoUrl !== undefined) settings.logoUrl = logoUrl;
    if (overlayDarkness !== undefined) settings.overlayDarkness = Number(overlayDarkness);
    if (establishedYear !== undefined) settings.establishedYear = Number(establishedYear);

    await settings.save();

    res.status(200).json(
        new ApiResponse(200, true, "Hero settings updated successfully", settings)
    );
});
