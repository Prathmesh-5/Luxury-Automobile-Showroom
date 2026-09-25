import AboutSettings from "../models/AboutSettings.js";
import asyncHandler from "../middleware/asyncHandler.js";
import ApiResponse from "../utils/apiResponse.js";

// @desc    Get About Page Settings (Public / Admin)
// @route   GET /api/about-settings
// @access  Public
export const getAboutSettings = asyncHandler(async (req, res) => {
    let settings = await AboutSettings.findOne();
    if (!settings) {
        settings = await AboutSettings.create({});
    }

    res.status(200).json(
        new ApiResponse(200, true, "About settings fetched successfully", settings)
    );
});

// @desc    Update About Page Settings (Admin Only)
// @route   PUT /api/about-settings
// @access  Private/Admin
export const updateAboutSettings = asyncHandler(async (req, res) => {
    let settings = await AboutSettings.findOne();
    if (!settings) {
        settings = new AboutSettings();
    }

    const {
        heroTitle,
        heroSubtitle,
        heroMediaType,
        heroImageUrl,
        heroImageAlt,
        heroVideoUrl,
        heroVideoPoster,
        showHeroSection,

        pinnacleTitle,
        pinnacleLeadText,
        pinnacleParagraph1,
        pinnacleParagraph2,
        pinnacleMediaType,
        pinnacleImageUrl,
        pinnacleImageAlt,
        pinnacleVideoUrl,
        pinnacleVideoPoster,
        showPinnacleSection,

        valuesTitle,
        showValuesSection,

        card1Number,
        card1Title,
        card1Description,
        card1Enabled,

        card2Number,
        card2Title,
        card2Description,
        card2Enabled,

        card3Number,
        card3Title,
        card3Description,
        card3Enabled
    } = req.body;

    if (heroTitle !== undefined) settings.heroTitle = heroTitle;
    if (heroSubtitle !== undefined) settings.heroSubtitle = heroSubtitle;
    if (heroMediaType !== undefined) settings.heroMediaType = heroMediaType;
    if (heroImageUrl !== undefined) settings.heroImageUrl = heroImageUrl;
    if (heroImageAlt !== undefined) settings.heroImageAlt = heroImageAlt;
    if (heroVideoUrl !== undefined) settings.heroVideoUrl = heroVideoUrl;
    if (heroVideoPoster !== undefined) settings.heroVideoPoster = heroVideoPoster;
    if (showHeroSection !== undefined) settings.showHeroSection = Boolean(showHeroSection);

    if (pinnacleTitle !== undefined) settings.pinnacleTitle = pinnacleTitle;
    if (pinnacleLeadText !== undefined) settings.pinnacleLeadText = pinnacleLeadText;
    if (pinnacleParagraph1 !== undefined) settings.pinnacleParagraph1 = pinnacleParagraph1;
    if (pinnacleParagraph2 !== undefined) settings.pinnacleParagraph2 = pinnacleParagraph2;
    if (pinnacleMediaType !== undefined) settings.pinnacleMediaType = pinnacleMediaType;
    if (pinnacleImageUrl !== undefined) settings.pinnacleImageUrl = pinnacleImageUrl;
    if (pinnacleImageAlt !== undefined) settings.pinnacleImageAlt = pinnacleImageAlt;
    if (pinnacleVideoUrl !== undefined) settings.pinnacleVideoUrl = pinnacleVideoUrl;
    if (pinnacleVideoPoster !== undefined) settings.pinnacleVideoPoster = pinnacleVideoPoster;
    if (showPinnacleSection !== undefined) settings.showPinnacleSection = Boolean(showPinnacleSection);

    if (valuesTitle !== undefined) settings.valuesTitle = valuesTitle;
    if (showValuesSection !== undefined) settings.showValuesSection = Boolean(showValuesSection);

    if (card1Number !== undefined) settings.card1Number = card1Number;
    if (card1Title !== undefined) settings.card1Title = card1Title;
    if (card1Description !== undefined) settings.card1Description = card1Description;
    if (card1Enabled !== undefined) settings.card1Enabled = Boolean(card1Enabled);

    if (card2Number !== undefined) settings.card2Number = card2Number;
    if (card2Title !== undefined) settings.card2Title = card2Title;
    if (card2Description !== undefined) settings.card2Description = card2Description;
    if (card2Enabled !== undefined) settings.card2Enabled = Boolean(card2Enabled);

    if (card3Number !== undefined) settings.card3Number = card3Number;
    if (card3Title !== undefined) settings.card3Title = card3Title;
    if (card3Description !== undefined) settings.card3Description = card3Description;
    if (card3Enabled !== undefined) settings.card3Enabled = Boolean(card3Enabled);

    await settings.save();

    res.status(200).json(
        new ApiResponse(200, true, "About settings updated successfully", settings)
    );
});

// @desc    Reset About Settings to Default Values
// @route   POST /api/about-settings/reset
// @access  Private/Admin
export const resetAboutSettings = asyncHandler(async (req, res) => {
    await AboutSettings.deleteMany({});
    const defaultSettings = await AboutSettings.create({});

    res.status(200).json(
        new ApiResponse(200, true, "About settings reset to default values", defaultSettings)
    );
});
