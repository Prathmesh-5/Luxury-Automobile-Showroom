import crypto from "crypto";
import NewsletterCampaign from "../models/NewsletterCampaign.js";
import NewsletterSubscriber from "../models/NewsletterSubscriber.js";
import asyncHandler from "../middleware/asyncHandler.js";
import ApiResponse from "../utils/apiResponse.js";
import ApiError from "../utils/ApiError.js";
import { isEmailConfigured, sendNewsletterEmail } from "../services/mailService.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// @desc    Create a newsletter campaign draft
// @route   POST /api/newsletter/campaigns
// @access  Private/Admin
export const createCampaign = asyncHandler(async (req, res) => {
    const { subject, content, recipientType, selectedSubscriberIds } = req.body;

    if (!subject || typeof subject !== "string" || !subject.trim()) {
        throw new ApiError(400, "Campaign subject is required.");
    }

    if (!content || typeof content !== "string" || !content.trim()) {
        throw new ApiError(400, "Campaign content is required.");
    }

    const type = recipientType === "selected" ? "selected" : "all_active";
    const selectedIds = Array.isArray(selectedSubscriberIds) ? selectedSubscriberIds : [];

    // Calculate live recipient count from MongoDB
    let recipientCount = 0;
    if (type === "all_active") {
        recipientCount = await NewsletterSubscriber.countDocuments({ status: "active" });
    } else {
        recipientCount = await NewsletterSubscriber.countDocuments({
            _id: { $in: selectedIds },
            status: "active"
        });
    }

    const campaign = await NewsletterCampaign.create({
        subject: subject.trim(),
        content,
        recipientType: type,
        selectedSubscriberIds: selectedIds,
        recipientCount,
        status: "draft",
        recipients: []
    });

    return res.status(201).json(
        new ApiResponse(201, true, "Newsletter campaign draft created successfully", campaign)
    );
});

// @desc    Get all newsletter campaigns with search, status, sort, & filters (Admin)
// @route   GET /api/newsletter/campaigns
// @access  Private/Admin
export const getCampaigns = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const {
        search,
        status,
        sortBy = "createdAt",
        order = "newest",
        dateRange,
        delivery,
        engagement
    } = req.query;

    let query = {};

    // 1. Search by subject (case-insensitive)
    if (search && search.trim()) {
        query.subject = new RegExp(search.trim(), "i");
    }

    // 2. Status filter
    if (status && status !== "All" && status !== "all") {
        query.status = status.toLowerCase();
    }

    // 3. Date Range filter
    if (dateRange && dateRange !== "All Time" && dateRange !== "all") {
        const now = new Date();
        let startDate;
        if (dateRange === "today" || dateRange === "Today") {
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        } else if (dateRange === "7d" || dateRange === "Last 7 Days") {
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        } else if (dateRange === "30d" || dateRange === "Last 30 Days") {
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        } else if (dateRange === "90d" || dateRange === "Last 90 Days") {
            startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        }
        if (startDate) {
            query.createdAt = { $gte: startDate };
        }
    }

    // 4. Delivery filter
    if (delivery && delivery !== "All" && delivery !== "all") {
        if (delivery === "fully_sent" || delivery === "Fully Sent") {
            query.status = "sent";
            query.failedCount = 0;
        } else if (delivery === "partially_failed" || delivery === "Partially Failed") {
            query.failedCount = { $gt: 0 };
            query.sentCount = { $gt: 0 };
        } else if (delivery === "completely_failed" || delivery === "Completely Failed") {
            query.$or = [{ status: "failed" }, { sentCount: 0, failedCount: { $gt: 0 } }];
        }
    }

    // 5. Sorting configuration
    let sortOption = {};
    const isAsc = order === "oldest" || order === "lowest" || order === "asc" || order === "a-z";
    const dir = isAsc ? 1 : -1;

    if (sortBy === "subject") {
        sortOption.subject = dir;
    } else if (sortBy === "sentAt") {
        sortOption.sentAt = dir;
    } else if (sortBy === "recipientCount" || sortBy === "recipients") {
        sortOption.recipientCount = dir;
    } else if (sortBy === "sentCount" || sortBy === "sent") {
        sortOption.sentCount = dir;
    } else {
        sortOption.createdAt = dir;
    }

    // Global summary counts (unfiltered DB totals for analytics cards)
    const [
        totalCampaigns,
        sentCampaigns,
        draftCampaigns,
        failedCampaigns,
        emailsSentAgg
    ] = await Promise.all([
        NewsletterCampaign.countDocuments({}),
        NewsletterCampaign.countDocuments({ status: "sent" }),
        NewsletterCampaign.countDocuments({ status: "draft" }),
        NewsletterCampaign.countDocuments({ status: "failed" }),
        NewsletterCampaign.aggregate([
            { $group: { _id: null, totalSent: { $sum: "$sentCount" } } }
        ])
    ]);

    const totalEmailsSent = emailsSentAgg[0]?.totalSent || 0;

    // Filtered campaigns for table
    const totalMatching = await NewsletterCampaign.countDocuments(query);
    const campaigns = await NewsletterCampaign.find(query)
        .sort(sortOption)
        .skip(skip)
        .limit(limit);

    const formattedCampaigns = campaigns.map((c) => {
        const obj = c.toObject();
        const recs = obj.recipients || [];
        const opened = recs.filter((r) => r.openedAt !== null && r.openedAt !== undefined).length;
        const clicked = recs.filter((r) => r.clickedAt !== null && r.clickedAt !== undefined).length;
        const total = obj.recipientCount || recs.length || 0;

        obj.openedCount = opened;
        obj.clickedCount = clicked;
        obj.openRate = total > 0 ? ((opened / total) * 100).toFixed(1) + "%" : "0.0%";
        obj.clickRate = total > 0 ? ((clicked / total) * 100).toFixed(1) + "%" : "0.0%";

        delete obj.recipients; // Keep campaign list payload lightweight
        return obj;
    });

    return res.status(200).json(
        new ApiResponse(200, true, "Campaigns retrieved successfully", {
            campaigns: formattedCampaigns,
            pagination: {
                total: totalMatching,
                page,
                pages: Math.ceil(totalMatching / limit) || 1,
                limit
            },
            summary: {
                totalCampaigns,
                sentCampaigns,
                draftCampaigns,
                failedCampaigns,
                totalEmailsSent
            }
        })
    );
});

// @desc    Get campaign by ID (Admin)
// @route   GET /api/newsletter/campaigns/:id
// @access  Private/Admin
export const getCampaignById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const campaign = await NewsletterCampaign.findById(id).populate(
        "selectedSubscriberIds",
        "email status subscribedAt"
    );

    if (!campaign) {
        throw new ApiError(404, "Newsletter campaign not found.");
    }

    const obj = campaign.toObject();
    const recs = obj.recipients || [];
    const opened = recs.filter((r) => r.openedAt !== null && r.openedAt !== undefined).length;
    const clicked = recs.filter((r) => r.clickedAt !== null && r.clickedAt !== undefined).length;
    const total = obj.recipientCount || recs.length || 0;

    obj.openedCount = opened;
    obj.clickedCount = clicked;
    obj.openRate = total > 0 ? ((opened / total) * 100).toFixed(1) + "%" : "0.0%";
    obj.clickRate = total > 0 ? ((clicked / total) * 100).toFixed(1) + "%" : "0.0%";

    return res.status(200).json(
        new ApiResponse(200, true, "Campaign details retrieved", obj)
    );
});

// @desc    Get recipient snapshot list for a specific campaign (Admin)
// @route   GET /api/newsletter/campaigns/:id/recipients
// @access  Private/Admin
export const getCampaignRecipients = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const search = req.query.search ? req.query.search.trim().toLowerCase() : "";
    const status = req.query.status ? req.query.status.trim().toLowerCase() : "";

    const campaign = await NewsletterCampaign.findById(id).populate(
        "selectedSubscriberIds",
        "email status subscribedAt"
    );

    if (!campaign) {
        throw new ApiError(404, "Newsletter campaign not found.");
    }

    let recipientList = [];

    if (Array.isArray(campaign.recipients) && campaign.recipients.length > 0) {
        recipientList = campaign.recipients.map((r) => ({
            _id: r._id,
            subscriberId: r.subscriberId,
            email: r.email,
            status: r.status || "sent",
            sentAt: r.sentAt || campaign.sentAt || campaign.createdAt,
            openedAt: r.openedAt || null,
            clickedAt: r.clickedAt || null
        }));
    } else if (campaign.status === "sent" || campaign.sentCount > 0) {
        // Fallback for legacy sent campaigns without stored recipients array
        let subs = [];
        if (campaign.recipientType === "selected" && campaign.selectedSubscriberIds?.length > 0) {
            subs = campaign.selectedSubscriberIds;
        } else {
            subs = await NewsletterSubscriber.find({
                createdAt: { $lte: campaign.sentAt || campaign.createdAt }
            }).select("email status subscribedAt");

            if (subs.length === 0) {
                subs = await NewsletterSubscriber.find({}).select("email status subscribedAt");
            }
        }

        recipientList = subs.map((sub) => ({
            _id: sub._id,
            subscriberId: sub._id,
            email: sub.email,
            status: "sent",
            sentAt: campaign.sentAt || campaign.createdAt,
            openedAt: null,
            clickedAt: null
        }));
    }

    // Apply filtering on recipient snapshot array
    if (search) {
        recipientList = recipientList.filter((r) => r.email.toLowerCase().includes(search));
    }
    if (status && status !== "all") {
        recipientList = recipientList.filter((r) => r.status.toLowerCase() === status);
    }

    const totalRecipients = recipientList.length;
    const totalPages = Math.ceil(totalRecipients / limit) || 1;
    const paginatedRecipients = recipientList.slice((page - 1) * limit, page * limit);

    return res.status(200).json(
        new ApiResponse(200, true, "Campaign recipient snapshot retrieved", {
            campaignId: campaign._id,
            subject: campaign.subject,
            recipients: paginatedRecipients,
            pagination: {
                total: totalRecipients,
                page,
                pages: totalPages,
                limit
            },
            counts: {
                recipientCount: campaign.recipientCount || totalRecipients,
                sentCount: campaign.sentCount || recipientList.filter((r) => r.status === "sent").length,
                failedCount: campaign.failedCount || recipientList.filter((r) => r.status === "failed").length
            }
        })
    );
});

// @desc    Export campaign recipient snapshot CSV (Admin)
// @route   GET /api/newsletter/campaigns/:id/export-recipients
// @access  Private/Admin
export const exportCampaignRecipientsCsv = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const campaign = await NewsletterCampaign.findById(id).populate(
        "selectedSubscriberIds",
        "email status subscribedAt"
    );

    if (!campaign) {
        throw new ApiError(404, "Newsletter campaign not found.");
    }

    let recipientList = [];
    if (Array.isArray(campaign.recipients) && campaign.recipients.length > 0) {
        recipientList = campaign.recipients;
    } else if (campaign.status === "sent" || campaign.sentCount > 0) {
        let subs = [];
        if (campaign.recipientType === "selected" && campaign.selectedSubscriberIds?.length > 0) {
            subs = campaign.selectedSubscriberIds;
        } else {
            subs = await NewsletterSubscriber.find({
                createdAt: { $lte: campaign.sentAt || campaign.createdAt }
            }).select("email status subscribedAt");
            if (subs.length === 0) {
                subs = await NewsletterSubscriber.find({}).select("email status subscribedAt");
            }
        }
        recipientList = subs.map((sub) => ({
            email: sub.email,
            status: "sent",
            sentAt: campaign.sentAt || campaign.createdAt,
            openedAt: null,
            clickedAt: null
        }));
    }

    const csvRows = [
        "Email,Status,Sent At,Opened At,Clicked At"
    ];

    recipientList.forEach((r) => {
        const email = `"${(r.email || "").replace(/"/g, '""')}"`;
        const statusVal = `"${r.status || "sent"}"`;
        const sentAt = r.sentAt ? `"${new Date(r.sentAt).toISOString()}"` : (campaign.sentAt ? `"${new Date(campaign.sentAt).toISOString()}"` : '""');
        const openedAt = r.openedAt ? `"${new Date(r.openedAt).toISOString()}"` : '""';
        const clickedAt = r.clickedAt ? `"${new Date(r.clickedAt).toISOString()}"` : '""';

        csvRows.push(`${email},${statusVal},${sentAt},${openedAt},${clickedAt}`);
    });

    const csvData = csvRows.join("\n");
    const sanitizedSubject = campaign.subject.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 30);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="campaign_recipients_${sanitizedSubject}.csv"`);
    return res.status(200).send(csvData);
});

// @desc    Update campaign draft (Admin)
// @route   PUT /api/newsletter/campaigns/:id
// @access  Private/Admin
export const updateCampaign = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { subject, content, recipientType, selectedSubscriberIds } = req.body;

    const campaign = await NewsletterCampaign.findById(id);

    if (!campaign) {
        throw new ApiError(404, "Newsletter campaign not found.");
    }

    if (campaign.status === "sent" || campaign.status === "sending") {
        throw new ApiError(400, "Sent or sending campaigns cannot be edited.");
    }

    if (subject && typeof subject === "string") campaign.subject = subject.trim();
    if (content && typeof content === "string") campaign.content = content;
    if (recipientType) campaign.recipientType = recipientType === "selected" ? "selected" : "all_active";
    if (Array.isArray(selectedSubscriberIds)) campaign.selectedSubscriberIds = selectedSubscriberIds;

    // Recalculate live recipient count
    if (campaign.recipientType === "all_active") {
        campaign.recipientCount = await NewsletterSubscriber.countDocuments({ status: "active" });
    } else {
        campaign.recipientCount = await NewsletterSubscriber.countDocuments({
            _id: { $in: campaign.selectedSubscriberIds },
            status: "active"
        });
    }

    await campaign.save();

    return res.status(200).json(
        new ApiResponse(200, true, "Campaign draft updated successfully", campaign)
    );
});

// @desc    Delete campaign (Admin)
// @route   DELETE /api/newsletter/campaigns/:id
// @access  Private/Admin
export const deleteCampaign = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const campaign = await NewsletterCampaign.findByIdAndDelete(id);

    if (!campaign) {
        throw new ApiError(404, "Newsletter campaign not found.");
    }

    return res.status(200).json(
        new ApiResponse(200, true, "Campaign deleted successfully.")
    );
});

// @desc    Send test campaign email (Admin)
// @route   POST /api/newsletter/campaigns/:id/test-email
// @access  Private/Admin
export const sendTestEmail = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { testEmail, subject: customSubject, content: customContent } = req.body;

    if (!testEmail || typeof testEmail !== "string" || !EMAIL_REGEX.test(testEmail.trim())) {
        throw new ApiError(400, "Please enter a valid test email address.");
    }

    let subject = customSubject;
    let content = customContent;

    if (!subject || !content) {
        const campaign = await NewsletterCampaign.findById(id);
        if (!campaign) {
            throw new ApiError(404, "Campaign not found.");
        }
        subject = subject || campaign.subject;
        content = content || campaign.content;
    }

    if (!isEmailConfigured()) {
        throw new ApiError(400, "SMTP email provider is not configured. Please set SMTP_HOST, SMTP_USER, SMTP_PASS in environment variables.");
    }

    const testSubject = `[TEST] ${subject}`;
    const sendResult = await sendNewsletterEmail(testEmail.trim(), testSubject, content, "test-preview-token");

    if (!sendResult.success) {
        throw new ApiError(500, `Failed to send test email: ${sendResult.error}`);
    }

    return res.status(200).json(
        new ApiResponse(200, true, `Test email successfully sent to ${testEmail.trim()}`)
    );
});

// @desc    Send campaign to active subscribers & record recipient snapshot (Admin)
// @route   POST /api/newsletter/campaigns/:id/send
// @access  Private/Admin
export const sendCampaign = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const campaign = await NewsletterCampaign.findById(id);

    if (!campaign) {
        throw new ApiError(404, "Newsletter campaign not found.");
    }

    // Protection against sending the same campaign again after it has reached sent status
    if (campaign.status === "sent") {
        throw new ApiError(400, "This campaign has already been sent and cannot be sent again.");
    }

    // Live MongoDB active recipient snapshot query
    let activeRecipients = [];
    if (campaign.recipientType === "all_active") {
        activeRecipients = await NewsletterSubscriber.find({ status: "active" }).select("+unsubscribeToken");
    } else {
        activeRecipients = await NewsletterSubscriber.find({
            _id: { $in: campaign.selectedSubscriberIds },
            status: "active"
        }).select("+unsubscribeToken");
    }

    const liveRecipientCount = activeRecipients.length;
    campaign.recipientCount = liveRecipientCount;

    if (liveRecipientCount === 0) {
        campaign.status = "failed";
        campaign.errorMessage = "No active subscribers found for this campaign.";
        await campaign.save();
        throw new ApiError(400, "No active subscribers found for this campaign.");
    }

    // Create initial recipient snapshot records with unique tracking tokens
    const recipientSnapshots = activeRecipients.map((sub) => ({
        subscriberId: sub._id,
        email: sub.email,
        status: "pending",
        sentAt: null,
        openedAt: null,
        clickedAt: null,
        trackingToken: crypto.randomBytes(16).toString("hex")
    }));
    campaign.recipients = recipientSnapshots;
    campaign.markModified("recipients");

    // Check SMTP provider configuration
    if (!isEmailConfigured()) {
        campaign.status = "failed";
        campaign.errorMessage = "SMTP credentials (SMTP_HOST, SMTP_USER, SMTP_PASS) are not configured in environment variables.";
        campaign.sentCount = 0;
        campaign.failedCount = liveRecipientCount;
        
        // Mark all snapshots as failed
        campaign.recipients.forEach((r) => {
            r.status = "failed";
        });
        campaign.markModified("recipients");
        await campaign.save();

        return res.status(400).json(
            new ApiResponse(400, false, "SMTP credentials are not configured in environment variables. Please set SMTP_HOST, SMTP_USER, SMTP_PASS in .env to enable sending.", campaign)
        );
    }

    // Execute real email dispatch
    campaign.status = "sending";
    await campaign.save();

    let sentCount = 0;
    let failedCount = 0;

    for (let i = 0; i < activeRecipients.length; i++) {
        const sub = activeRecipients[i];
        const trackingToken = campaign.recipients[i]?.trackingToken || "";
        const result = await sendNewsletterEmail(sub.email, campaign.subject, campaign.content, sub.unsubscribeToken, trackingToken);

        if (result.success) {
            sentCount++;
            campaign.recipients[i].status = "sent";
            campaign.recipients[i].sentAt = new Date();
        } else {
            failedCount++;
            campaign.recipients[i].status = "failed";
            campaign.recipients[i].sentAt = null;
        }
    }

    campaign.status = sentCount > 0 ? "sent" : "failed";
    campaign.sentCount = sentCount;
    campaign.failedCount = failedCount;
    campaign.sentAt = new Date();
    campaign.errorMessage = failedCount > 0 && sentCount === 0 ? "All recipient email dispatches failed." : "";
    campaign.markModified("recipients");
    await campaign.save();

    return res.status(200).json(
        new ApiResponse(200, true, `Campaign dispatch completed: ${sentCount} sent, ${failedCount} failed.`, campaign)
    );
});
