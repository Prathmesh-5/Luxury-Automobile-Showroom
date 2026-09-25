import mongoose from "mongoose";

const recipientSchema = new mongoose.Schema(
    {
        subscriberId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "NewsletterSubscriber"
        },
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true
        },
        status: {
            type: String,
            enum: ["pending", "sent", "failed"],
            default: "pending"
        },
        sentAt: {
            type: Date,
            default: null
        },
        openedAt: {
            type: Date,
            default: null
        },
        clickedAt: {
            type: Date,
            default: null
        },
        trackingToken: {
            type: String,
            default: null,
            index: true
        }
    },
    { _id: true, timestamps: false }
);

const newsletterCampaignSchema = new mongoose.Schema(
    {
        subject: {
            type: String,
            required: [true, "Campaign subject is required"],
            trim: true
        },
        content: {
            type: String,
            required: [true, "Campaign content is required"]
        },
        status: {
            type: String,
            enum: ["draft", "sending", "sent", "failed"],
            default: "draft",
            index: true
        },
        recipientType: {
            type: String,
            enum: ["all_active", "selected"],
            default: "all_active"
        },
        selectedSubscriberIds: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "NewsletterSubscriber"
            }
        ],
        recipientCount: {
            type: Number,
            default: 0
        },
        sentCount: {
            type: Number,
            default: 0
        },
        failedCount: {
            type: Number,
            default: 0
        },
        sentAt: {
            type: Date,
            default: null
        },
        errorMessage: {
            type: String,
            default: ""
        },
        recipients: [recipientSchema]
    },
    {
        timestamps: true
    }
);

const NewsletterCampaign = mongoose.model("NewsletterCampaign", newsletterCampaignSchema);

export default NewsletterCampaign;
