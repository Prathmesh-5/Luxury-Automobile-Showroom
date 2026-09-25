import ContactSettings from "../models/ContactSettings.js";
import asyncHandler from "../middleware/asyncHandler.js";
import ApiResponse from "../utils/apiResponse.js";

// @desc    Get Contact Page Settings (Public / Admin)
// @route   GET /api/contact-settings
// @access  Public
export const getContactSettings = asyncHandler(async (req, res) => {
    let settings = await ContactSettings.findOne();
    if (!settings) {
        settings = await ContactSettings.create({});
    }

    res.status(200).json(
        new ApiResponse(200, true, "Contact settings fetched successfully", settings)
    );
});

// @desc    Update Contact Page Settings (Admin Only)
// @route   PUT /api/contact-settings
// @access  Private/Admin
export const updateContactSettings = asyncHandler(async (req, res) => {
    let settings = await ContactSettings.findOne();
    if (!settings) {
        settings = new ContactSettings();
    }

    const {
        heroHeading,
        heroSubtitle,
        heroMediaType,
        heroImageUrl,
        heroImageAlt,
        heroVideoUrl,
        heroVideoPoster,
        showHeroSection,

        getInTouchHeading,
        getInTouchDescription,
        showGetInTouchSection,

        visitShowroomTitle,
        visitShowroomAddress,
        showVisitShowroomCard,

        callShowroomTitle,
        callShowroomPhone,
        showCallShowroomCard,

        emailSupportTitle,
        emailSupportEmail,
        showEmailSupportCard,

        showroomTimingsTitle,
        showroomTimingsLine1,
        showroomTimingsLine2,
        showShowroomTimingsCard,

        formHeading,
        formNamePlaceholder,
        formEmailPlaceholder,
        formPhonePlaceholder,
        formMessagePlaceholder,
        formSubmitButtonText,
        showContactForm,

        mapPlaceName,
        mapAddress,
        mapEmbedUrl,
        mapLatitude,
        mapLongitude,
        mapZoom,
        showMapSection
    } = req.body;

    // Update fields if provided
    if (heroHeading !== undefined) settings.heroHeading = heroHeading;
    if (heroSubtitle !== undefined) settings.heroSubtitle = heroSubtitle;
    if (heroMediaType !== undefined) settings.heroMediaType = heroMediaType;
    if (heroImageUrl !== undefined) settings.heroImageUrl = heroImageUrl;
    if (heroImageAlt !== undefined) settings.heroImageAlt = heroImageAlt;
    if (heroVideoUrl !== undefined) settings.heroVideoUrl = heroVideoUrl;
    if (heroVideoPoster !== undefined) settings.heroVideoPoster = heroVideoPoster;
    if (showHeroSection !== undefined) settings.showHeroSection = Boolean(showHeroSection);

    if (getInTouchHeading !== undefined) settings.getInTouchHeading = getInTouchHeading;
    if (getInTouchDescription !== undefined) settings.getInTouchDescription = getInTouchDescription;
    if (showGetInTouchSection !== undefined) settings.showGetInTouchSection = Boolean(showGetInTouchSection);

    if (visitShowroomTitle !== undefined) settings.visitShowroomTitle = visitShowroomTitle;
    if (visitShowroomAddress !== undefined) settings.visitShowroomAddress = visitShowroomAddress;
    if (showVisitShowroomCard !== undefined) settings.showVisitShowroomCard = Boolean(showVisitShowroomCard);

    if (callShowroomTitle !== undefined) settings.callShowroomTitle = callShowroomTitle;
    if (callShowroomPhone !== undefined) settings.callShowroomPhone = callShowroomPhone;
    if (showCallShowroomCard !== undefined) settings.showCallShowroomCard = Boolean(showCallShowroomCard);

    if (emailSupportTitle !== undefined) settings.emailSupportTitle = emailSupportTitle;
    if (emailSupportEmail !== undefined) settings.emailSupportEmail = emailSupportEmail;
    if (showEmailSupportCard !== undefined) settings.showEmailSupportCard = Boolean(showEmailSupportCard);

    if (showroomTimingsTitle !== undefined) settings.showroomTimingsTitle = showroomTimingsTitle;
    if (showroomTimingsLine1 !== undefined) settings.showroomTimingsLine1 = showroomTimingsLine1;
    if (showroomTimingsLine2 !== undefined) settings.showroomTimingsLine2 = showroomTimingsLine2;
    if (showShowroomTimingsCard !== undefined) settings.showShowroomTimingsCard = Boolean(showShowroomTimingsCard);

    if (formHeading !== undefined) settings.formHeading = formHeading;
    if (formNamePlaceholder !== undefined) settings.formNamePlaceholder = formNamePlaceholder;
    if (formEmailPlaceholder !== undefined) settings.formEmailPlaceholder = formEmailPlaceholder;
    if (formPhonePlaceholder !== undefined) settings.formPhonePlaceholder = formPhonePlaceholder;
    if (formMessagePlaceholder !== undefined) settings.formMessagePlaceholder = formMessagePlaceholder;
    if (formSubmitButtonText !== undefined) settings.formSubmitButtonText = formSubmitButtonText;
    if (showContactForm !== undefined) settings.showContactForm = Boolean(showContactForm);

    if (mapPlaceName !== undefined) settings.mapPlaceName = mapPlaceName;
    if (mapAddress !== undefined) settings.mapAddress = mapAddress;
    if (mapEmbedUrl !== undefined) settings.mapEmbedUrl = mapEmbedUrl;
    if (mapLatitude !== undefined) settings.mapLatitude = mapLatitude;
    if (mapLongitude !== undefined) settings.mapLongitude = mapLongitude;
    if (mapZoom !== undefined) settings.mapZoom = mapZoom;
    if (showMapSection !== undefined) settings.showMapSection = Boolean(showMapSection);

    await settings.save();

    res.status(200).json(
        new ApiResponse(200, true, "Contact settings updated successfully", settings)
    );
});

// @desc    Reset Contact Settings to Default Values
// @route   POST /api/contact-settings/reset
// @access  Private/Admin
export const resetContactSettings = asyncHandler(async (req, res) => {
    await ContactSettings.deleteMany({});
    const defaultSettings = await ContactSettings.create({});

    res.status(200).json(
        new ApiResponse(200, true, "Contact settings reset to default values", defaultSettings)
    );
});
