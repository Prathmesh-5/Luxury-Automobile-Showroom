import mongoose from "mongoose";

const heroSettingsSchema = new mongoose.Schema(
    {
        smallBadgeText: {
            type: String,
            default: "PREMIUM LUXURY AUTOMOBILES",
            trim: true
        },
        mainTitle: {
            type: String,
            default: "Drive Beyond",
            trim: true
        },
        highlightTitle: {
            type: String,
            default: "Luxury",
            trim: true
        },
        descriptionText: {
            type: String,
            default: "Discover an exclusive collection of luxury, sports and exotic cars crafted for those who demand excellence.",
            trim: true
        },
        topRightBadgeText: {
            type: String,
            default: "★ Trusted Since 2003",
            trim: true
        },
        mediaType: {
            type: String,
            enum: ["image", "video"],
            default: "image"
        },
        desktopHeroImage: {
            type: String,
            default: ""
        },
        mobileHeroImage: {
            type: String,
            default: ""
        },
        heroVideo: {
            type: String,
            default: ""
        },
        exploreBtnText: {
            type: String,
            default: "Explore Collection",
            trim: true
        },
        exploreBtnLink: {
            type: String,
            default: "/cars",
            trim: true
        },
        bookBtnText: {
            type: String,
            default: "Book Test Drive",
            trim: true
        },
        bookBtnLink: {
            type: String,
            default: "/test-drive",
            trim: true
        },
        logoUrl: {
            type: String,
            default: ""
        },
        overlayDarkness: {
            type: Number,
            default: 0.6,
            min: 0,
            max: 1
        },
        establishedYear: {
            type: Number,
            default: 2003
        }
    },
    {
        timestamps: true
    }
);

const HeroSettings = mongoose.model("HeroSettings", heroSettingsSchema);

export default HeroSettings;
