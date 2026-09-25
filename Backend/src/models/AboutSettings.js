import mongoose from "mongoose";

const aboutSettingsSchema = new mongoose.Schema(
    {
        // 1. Hero Section
        heroTitle: {
            type: String,
            default: "About Apex",
            trim: true
        },
        heroSubtitle: {
            type: String,
            default: "Crafting bespoke luxury automotive legacies since 2003",
            trim: true
        },
        heroMediaType: {
            type: String,
            enum: ["image", "video"],
            default: "image"
        },
        heroImageUrl: {
            type: String,
            default: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1600&auto=format&fit=crop&q=80"
        },
        heroImageAlt: {
            type: String,
            default: "About Apex Banner",
            trim: true
        },
        heroVideoUrl: {
            type: String,
            default: ""
        },
        heroVideoPoster: {
            type: String,
            default: ""
        },
        showHeroSection: {
            type: Boolean,
            default: true
        },

        // 2. Pinnacle of Luxury Section
        pinnacleTitle: {
            type: String,
            default: "The Pinnacle of Luxury",
            trim: true
        },
        pinnacleLeadText: {
            type: String,
            default: "Apex Luxury Automobiles represents more than a dealership; we represent a gateway to the world’s most refined driving experiences.",
            trim: true
        },
        pinnacleParagraph1: {
            type: String,
            default: "Founded in 2003 in Dubai, we have established a reputation as a trusted purveyor of high-performance supercars, premium SUVs, and hand-crafted grand tourers. Our commitment to absolute quality guides everything we do, from vehicle selection to post-sale customization.",
            trim: true
        },
        pinnacleParagraph2: {
            type: String,
            default: "Each vehicle in our showroom undergoes a meticulous multi-point inspection by certified mechanics, ensuring that only pristine models reach our distinguished clientele.",
            trim: true
        },
        pinnacleMediaType: {
            type: String,
            enum: ["image", "video"],
            default: "image"
        },
        pinnacleImageUrl: {
            type: String,
            default: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80"
        },
        pinnacleImageAlt: {
            type: String,
            default: "Showroom Display",
            trim: true
        },
        pinnacleVideoUrl: {
            type: String,
            default: ""
        },
        pinnacleVideoPoster: {
            type: String,
            default: ""
        },
        showPinnacleSection: {
            type: Boolean,
            default: true
        },

        // 3. Core Values Section
        valuesTitle: {
            type: String,
            default: "Our Core Values",
            trim: true
        },
        showValuesSection: {
            type: Boolean,
            default: true
        },

        // Card 1
        card1Number: { type: String, default: "01", trim: true },
        card1Title: { type: String, default: "Excellence", trim: true },
        card1Description: { type: String, default: "We demand excellence in our inventory, our services, and our guest hospitality, delivering a world-class environment.", trim: true },
        card1Enabled: { type: Boolean, default: true },

        // Card 2
        card2Number: { type: String, default: "02", trim: true },
        card2Title: { type: String, default: "Integrity", trim: true },
        card2Description: { type: String, default: "Transparent dealings, absolute authenticity, and honest certifications form the foundations of customer trust.", trim: true },
        card2Enabled: { type: Boolean, default: true },

        // Card 3
        card3Number: { type: String, default: "03", trim: true },
        card3Title: { type: String, default: "Bespoke Care", trim: true },
        card3Description: { type: String, default: "Every customer is unique. We provide customized buying plans, international logistics, and tailored customizations.", trim: true },
        card3Enabled: { type: Boolean, default: true }
    },
    {
        timestamps: true
    }
);

const AboutSettings = mongoose.model("AboutSettings", aboutSettingsSchema);

export default AboutSettings;
