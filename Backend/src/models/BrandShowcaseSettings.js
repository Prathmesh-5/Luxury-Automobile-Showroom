import mongoose from "mongoose";

const brandShowcaseSettingsSchema = new mongoose.Schema(
    {
        smallHeading: {
            type: String,
            default: "WORLD'S FINEST AUTOMOBILE BRANDS",
            trim: true
        },
        mainHeading: {
            type: String,
            default: "Luxury Brands",
            trim: true
        },
        showSection: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

const BrandShowcaseSettings = mongoose.model("BrandShowcaseSettings", brandShowcaseSettingsSchema);

export default BrandShowcaseSettings;
