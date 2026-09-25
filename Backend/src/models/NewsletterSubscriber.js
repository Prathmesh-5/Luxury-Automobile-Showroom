import mongoose from "mongoose";
import crypto from "crypto";

const newsletterSubscriberSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: [true, "Email address is required"],
            unique: true,
            trim: true,
            lowercase: true,
            index: true
        },
        status: {
            type: String,
            enum: ["active", "unsubscribed"],
            default: "active",
            index: true
        },
        subscribedAt: {
            type: Date,
            default: Date.now
        },
        unsubscribedAt: {
            type: Date,
            default: null
        },
        unsubscribeToken: {
            type: String,
            unique: true,
            select: false,
            default: () => crypto.randomBytes(32).toString("hex")
        }
    },
    {
        timestamps: true
    }
);

const NewsletterSubscriber = mongoose.model("NewsletterSubscriber", newsletterSubscriberSchema);

export default NewsletterSubscriber;
