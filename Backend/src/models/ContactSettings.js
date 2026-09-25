import mongoose from "mongoose";

const contactSettingsSchema = new mongoose.Schema(
    {
        // 1. Hero Section
        heroHeading: {
            type: String,
            default: "CONTACT US",
            trim: true
        },
        heroSubtitle: {
            type: String,
            default: "Connect with our expert advisors for bespoke automobile services",
            trim: true
        },
        heroMediaType: {
            type: String,
            enum: ["image", "video"],
            default: "image"
        },
        heroImageUrl: {
            type: String,
            default: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1600&auto=format&fit=crop&q=80"
        },
        heroImageAlt: {
            type: String,
            default: "Contact Banner",
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

        // 2. Get In Touch Section
        getInTouchHeading: {
            type: String,
            default: "Get In Touch",
            trim: true
        },
        getInTouchDescription: {
            type: String,
            default: "Have a question about our inventory, shipping, or trade-in evaluations? Feel free to contact our showroom advisors.",
            trim: true
        },
        showGetInTouchSection: {
            type: Boolean,
            default: true
        },

        // 3. Visit Showroom Card
        visitShowroomTitle: {
            type: String,
            default: "Visit Showroom",
            trim: true
        },
        visitShowroomAddress: {
            type: String,
            default: "Sheikh Zayed Road, Al Quoz 3, Dubai, United Arab Emirates",
            trim: true
        },
        showVisitShowroomCard: {
            type: Boolean,
            default: true
        },

        // 4. Call Showroom Card
        callShowroomTitle: {
            type: String,
            default: "Call Showroom",
            trim: true
        },
        callShowroomPhone: {
            type: String,
            default: "+971 4 000 0000",
            trim: true
        },
        showCallShowroomCard: {
            type: Boolean,
            default: true
        },

        // 5. Email Support Card
        emailSupportTitle: {
            type: String,
            default: "Email Support",
            trim: true
        },
        emailSupportEmail: {
            type: String,
            default: "info@apexluxury.ae",
            trim: true
        },
        showEmailSupportCard: {
            type: Boolean,
            default: true
        },

        // 6. Showroom Timings Card
        showroomTimingsTitle: {
            type: String,
            default: "Showroom Timings",
            trim: true
        },
        showroomTimingsLine1: {
            type: String,
            default: "Monday - Saturday: 9:00 AM - 9:00 PM",
            trim: true
        },
        showroomTimingsLine2: {
            type: String,
            default: "Sunday: 2:00 PM - 8:00 PM",
            trim: true
        },
        showShowroomTimingsCard: {
            type: Boolean,
            default: true
        },

        // 7. Contact Form Settings
        formHeading: {
            type: String,
            default: "Send a Message",
            trim: true
        },
        formNamePlaceholder: {
            type: String,
            default: "Your Name",
            trim: true
        },
        formEmailPlaceholder: {
            type: String,
            default: "Email Address",
            trim: true
        },
        formPhonePlaceholder: {
            type: String,
            default: "Phone Number",
            trim: true
        },
        formMessagePlaceholder: {
            type: String,
            default: "How can we assist you?",
            trim: true
        },
        formSubmitButtonText: {
            type: String,
            default: "Send Message",
            trim: true
        },
        showContactForm: {
            type: Boolean,
            default: true
        },

        // 8 & 9. Map / Location Settings
        mapPlaceName: {
            type: String,
            default: "Sheikh Zayed Road, Al Quoz 3, Dubai, UAE",
            trim: true
        },
        mapAddress: {
            type: String,
            default: "Sheikh Zayed Road, Al Quoz 3, Dubai, United Arab Emirates",
            trim: true
        },
        mapEmbedUrl: {
            type: String,
            default: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d115546.61111666874!2d55.20786968037107!3d25.17478648348873!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e5f43348a6d49bb%3A0x3b0779d71c4c1a40!2sSheikh%20Zayed%20Rd%20-%20Dubai%20-%20United%20Arab%20Emirates!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
        },
        mapLatitude: {
            type: String,
            default: "25.17478648348873",
            trim: true
        },
        mapLongitude: {
            type: String,
            default: "55.20786968037107",
            trim: true
        },
        mapZoom: {
            type: String,
            default: "13",
            trim: true
        },
        showMapSection: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

const ContactSettings = mongoose.model("ContactSettings", contactSettingsSchema);

export default ContactSettings;
