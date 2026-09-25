import mongoose from "mongoose";

const quickLinkSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
    isExternal: { type: Boolean, default: false },
    enabled: { type: Boolean, default: true },
    order: { type: Number, default: 0 }
}, { _id: true });

const socialLinkSchema = new mongoose.Schema({
    platform: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
    icon: { type: String, default: "facebook" },
    enabled: { type: Boolean, default: true }
}, { _id: true });

const footerSettingsSchema = new mongoose.Schema(
    {
        logoUrl: {
            type: String,
            default: ""
        },
        description: {
            type: String,
            default: "Discover an exclusive collection of luxury, sports, and exotic automobiles. We define excellence and bespoke automotive experiences.",
            trim: true
        },
        quickLinks: {
            type: [quickLinkSchema],
            default: [
                { title: "Our Inventory", url: "/cars", isExternal: false, enabled: true, order: 1 },
                { title: "Sell Your Car", url: "/sell-your-car", isExternal: false, enabled: true, order: 2 },
                { title: "About Us", url: "/about", isExternal: false, enabled: true, order: 3 },
                { title: "Contact Support", url: "/contact", isExternal: false, enabled: true, order: 4 },
                { title: "FAQs / Chatbot", url: "/faq", isExternal: false, enabled: true, order: 5 }
            ]
        },
        address: {
            type: String,
            default: "Sheikh Zayed Road, Al Quoz 3, Dubai, UAE",
            trim: true
        },
        phone: {
            type: String,
            default: "+971 4 000 0000",
            trim: true
        },
        email: {
            type: String,
            default: "info@apexluxury.ae",
            trim: true
        },
        businessHours: {
            type: String,
            default: "Mon - Sat: 9:00 AM - 9:00 PM",
            trim: true
        },
        socialLinks: {
            type: [socialLinkSchema],
            default: [
                { platform: "Facebook", url: "#", icon: "facebook", enabled: true },
                { platform: "Instagram", url: "#", icon: "instagram", enabled: true },
                { platform: "Twitter", url: "#", icon: "twitter", enabled: true },
                { platform: "YouTube", url: "#", icon: "youtube", enabled: true }
            ]
        },
        newsletterHeading: {
            type: String,
            default: "Newsletter",
            trim: true
        },
        newsletterDescription: {
            type: String,
            default: "Subscribe to receive updates on our latest luxury arrivals.",
            trim: true
        },
        newsletterPlaceholder: {
            type: String,
            default: "Your Email Address",
            trim: true
        },
        newsletterButtonText: {
            type: String,
            default: "Subscribe",
            trim: true
        },
        carImageUrl: {
            type: String,
            default: ""
        },
        carImageAlt: {
            type: String,
            default: "Luxury Sports Car",
            trim: true
        },
        copyrightText: {
            type: String,
            default: "Apex Luxury Showroom. All Rights Reserved.",
            trim: true
        },
        autoCurrentYear: {
            type: Boolean,
            default: true
        },
        // Section Visibility Toggles
        showLogo: { type: Boolean, default: true },
        showDescription: { type: Boolean, default: true },
        showSocialLinks: { type: Boolean, default: true },
        showQuickLinks: { type: Boolean, default: true },
        showShowroomInfo: { type: Boolean, default: true },
        showNewsletter: { type: Boolean, default: true },
        showCarImage: { type: Boolean, default: true },
        showCopyright: { type: Boolean, default: true }
    },
    {
        timestamps: true
    }
);

const FooterSettings = mongoose.model("FooterSettings", footerSettingsSchema);

export default FooterSettings;
