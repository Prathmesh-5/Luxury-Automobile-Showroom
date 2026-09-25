import NewsletterSubscriber from "../models/NewsletterSubscriber.js";
import NewsletterCampaign from "../models/NewsletterCampaign.js";
import asyncHandler from "../middleware/asyncHandler.js";
import ApiResponse from "../utils/apiResponse.js";
import ApiError from "../utils/ApiError.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// @desc    Track newsletter email open (Public transparent 1x1 GIF)
// @route   GET /api/newsletter/track/open/:trackingToken
// @access  Public
export const trackEmailOpen = asyncHandler(async (req, res) => {
    const { trackingToken } = req.params;

    const transparentGif = Buffer.from(
        "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
        "base64"
    );

    res.setHeader("Content-Type", "image/gif");
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate, private");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    if (trackingToken && typeof trackingToken === "string" && trackingToken.trim()) {
        try {
            const campaign = await NewsletterCampaign.findOne({
                "recipients.trackingToken": trackingToken.trim()
            });

            if (campaign) {
                const recipient = campaign.recipients.find(
                    (r) => r.trackingToken === trackingToken.trim()
                );
                if (recipient && !recipient.openedAt) {
                    recipient.openedAt = new Date();
                    campaign.markModified("recipients");
                    await campaign.save();
                }
            }
        } catch (err) {
            console.error("Open tracking error:", err);
        }
    }

    return res.status(200).send(transparentGif);
});

// @desc    Track newsletter link click & redirect to target URL (Public)
// @route   GET /api/newsletter/track/click/:trackingToken
// @access  Public
export const trackLinkClick = asyncHandler(async (req, res) => {
    const { trackingToken } = req.params;
    const rawUrl = req.query.url || req.query.target;

    const defaultRedirect = process.env.VITE_CLIENT_URL || process.env.CLIENT_URL || "http://localhost:5173";

    let targetUrl = defaultRedirect;
    if (rawUrl && typeof rawUrl === "string") {
        try {
            const decoded = decodeURIComponent(rawUrl.trim());
            if (decoded.startsWith("http://") || decoded.startsWith("https://") || decoded.startsWith("/")) {
                targetUrl = decoded;
            }
        } catch (e) {
            console.error("URL decode error:", e);
        }
    }

    if (trackingToken && typeof trackingToken === "string" && trackingToken.trim()) {
        try {
            const campaign = await NewsletterCampaign.findOne({
                "recipients.trackingToken": trackingToken.trim()
            });

            if (campaign) {
                const recipient = campaign.recipients.find(
                    (r) => r.trackingToken === trackingToken.trim()
                );
                if (recipient) {
                    let updated = false;
                    if (!recipient.clickedAt) {
                        recipient.clickedAt = new Date();
                        updated = true;
                    }
                    if (!recipient.openedAt) {
                        recipient.openedAt = new Date();
                        updated = true;
                    }
                    if (updated) {
                        campaign.markModified("recipients");
                        await campaign.save();
                    }
                }
            }
        } catch (err) {
            console.error("Click tracking error:", err);
        }
    }

    return res.redirect(302, targetUrl);
});

// @desc    Subscribe to newsletter
// @route   POST /api/newsletter/subscribe
// @access  Public
export const subscribe = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email || typeof email !== "string" || !email.trim()) {
        throw new ApiError(400, "Please enter a valid email address.");
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!EMAIL_REGEX.test(normalizedEmail)) {
        throw new ApiError(400, "Please enter a valid email address.");
    }

    try {
        let subscriber = await NewsletterSubscriber.findOne({ email: normalizedEmail });

        if (subscriber) {
            if (subscriber.status === "active") {
                return res.status(200).json(
                    new ApiResponse(200, true, "You're already subscribed.")
                );
            }

            // Reactivate unsubscribed user
            subscriber.status = "active";
            subscriber.subscribedAt = new Date();
            subscriber.unsubscribedAt = null;
            await subscriber.save();

            return res.status(200).json(
                new ApiResponse(200, true, "Thank you for subscribing!", subscriber)
            );
        }

        // Create new subscriber
        subscriber = await NewsletterSubscriber.create({
            email: normalizedEmail,
            status: "active",
            subscribedAt: new Date()
        });

        return res.status(201).json(
            new ApiResponse(201, true, "Thank you for subscribing!", subscriber)
        );
    } catch (err) {
        if (err.code === 11000) {
            const existing = await NewsletterSubscriber.findOne({ email: normalizedEmail });
            if (existing && existing.status === "active") {
                return res.status(200).json(
                    new ApiResponse(200, true, "You're already subscribed.")
                );
            } else if (existing) {
                existing.status = "active";
                existing.subscribedAt = new Date();
                existing.unsubscribedAt = null;
                await existing.save();
                return res.status(200).json(
                    new ApiResponse(200, true, "Thank you for subscribing!", existing)
                );
            }
        }
        throw err;
    }
});

// @desc    Unsubscribe via secure token
// @route   GET /api/newsletter/unsubscribe
// @access  Public
export const unsubscribeByToken = asyncHandler(async (req, res) => {
    const token = req.query.token || req.body.token;

    if (!token || typeof token !== "string" || !token.trim()) {
        throw new ApiError(400, "Invalid or missing unsubscribe token.");
    }

    const subscriber = await NewsletterSubscriber.findOne({ unsubscribeToken: token.trim() }).select("+unsubscribeToken");

    if (!subscriber) {
        throw new ApiError(404, "Invalid or expired unsubscribe link.");
    }

    if (subscriber.status === "unsubscribed") {
        return res.status(200).json(
            new ApiResponse(200, true, "You are already unsubscribed from our newsletter.")
        );
    }

    subscriber.status = "unsubscribed";
    subscriber.unsubscribedAt = new Date();
    await subscriber.save();

    return res.status(200).json(
        new ApiResponse(200, true, "You have been successfully unsubscribed from our newsletter.")
    );
});

// @desc    Get newsletter analytics & growth metrics (Admin)
// @route   GET /api/newsletter/analytics
// @access  Private/Admin
export const getAnalytics = asyncHandler(async (req, res) => {
    const range = req.query.range || "30d"; // "7d", "30d", "90d"
    let days = 30;
    if (range === "7d") days = 7;
    if (range === "90d") days = 90;

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const currentPeriodStart = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const previousPeriodStart = new Date(now.getTime() - 2 * days * 24 * 60 * 60 * 1000);

    const [
        totalSubscribers,
        activeSubscribers,
        unsubscribedCount,
        newToday,
        newThisWeek,
        newThisMonth,
        currentPeriodCount,
        previousPeriodCount,
        recentSubscribers
    ] = await Promise.all([
        NewsletterSubscriber.countDocuments({}),
        NewsletterSubscriber.countDocuments({ status: "active" }),
        NewsletterSubscriber.countDocuments({ status: "unsubscribed" }),
        NewsletterSubscriber.countDocuments({ createdAt: { $gte: startOfToday } }),
        NewsletterSubscriber.countDocuments({ createdAt: { $gte: startOfWeek } }),
        NewsletterSubscriber.countDocuments({ createdAt: { $gte: startOfMonth } }),
        NewsletterSubscriber.countDocuments({ createdAt: { $gte: currentPeriodStart } }),
        NewsletterSubscriber.countDocuments({ createdAt: { $gte: previousPeriodStart, $lt: currentPeriodStart } }),
        NewsletterSubscriber.find().sort({ createdAt: -1 }).limit(5)
    ]);

    // Calculate growth percentage safely
    let growthPercentage = 0;
    if (previousPeriodCount === 0) {
        growthPercentage = currentPeriodCount > 0 ? 100 : 0;
    } else {
        growthPercentage = Math.round(((currentPeriodCount - previousPeriodCount) / previousPeriodCount) * 100);
    }

    // Build real time-series chart data from MongoDB
    const timeSeriesMap = {};
    for (let i = days - 1; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dateStr = d.toISOString().slice(0, 10);
        timeSeriesMap[dateStr] = 0;
    }

    const aggregated = await NewsletterSubscriber.aggregate([
        {
            $match: {
                createdAt: { $gte: currentPeriodStart }
            }
        },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                count: { $sum: 1 }
            }
        }
    ]);

    aggregated.forEach((item) => {
        if (timeSeriesMap[item._id] !== undefined) {
            timeSeriesMap[item._id] = item.count;
        }
    });

    const timeSeries = Object.keys(timeSeriesMap).map((dateKey) => {
        const d = new Date(dateKey + "T00:00:00");
        return {
            date: dateKey,
            label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            count: timeSeriesMap[dateKey]
        };
    });

    return res.status(200).json(
        new ApiResponse(200, true, "Newsletter analytics retrieved successfully", {
            metrics: {
                totalSubscribers,
                activeSubscribers,
                unsubscribedCount,
                newToday,
                newThisWeek,
                newThisMonth,
                growthPercentage,
                currentPeriodCount,
                previousPeriodCount
            },
            timeSeries,
            recentSubscribers
        })
    );
});

// @desc    Get all newsletter subscribers with search, filter, date range & sort (Admin)
// @route   GET /api/newsletter/subscribers
// @access  Private/Admin
export const getSubscribers = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const { status, search, sort, dateRange } = req.query;

    let query = {};

    if (status && status !== "All") {
        query.status = status.toLowerCase();
    }

    if (search && search.trim()) {
        query.email = new RegExp(search.trim(), "i");
    }

    if (dateRange && dateRange !== "All Time" && dateRange !== "all") {
        const now = new Date();
        let startDate;
        if (dateRange === "today" || dateRange === "Today") {
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        } else if (dateRange === "7d" || dateRange === "Last 7 Days") {
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        } else if (dateRange === "30d" || dateRange === "Last 30 Days") {
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        }
        if (startDate) {
            query.createdAt = { $gte: startDate };
        }
    }

    const sortOption = sort === "oldest" || sort === "Oldest" ? { createdAt: 1 } : { createdAt: -1 };

    const [totalSubscribers, activeSubscribers, unsubscribedCount] = await Promise.all([
        NewsletterSubscriber.countDocuments({}),
        NewsletterSubscriber.countDocuments({ status: "active" }),
        NewsletterSubscriber.countDocuments({ status: "unsubscribed" })
    ]);

    const totalMatching = await NewsletterSubscriber.countDocuments(query);
    const subscribers = await NewsletterSubscriber.find(query)
        .sort(sortOption)
        .skip(skip)
        .limit(limit);

    return res.status(200).json(
        new ApiResponse(200, true, "Subscribers retrieved successfully", {
            subscribers,
            pagination: {
                total: totalMatching,
                page,
                pages: Math.ceil(totalMatching / limit) || 1,
                limit
            },
            stats: {
                totalSubscribers,
                activeSubscribers,
                unsubscribedCount
            }
        })
    );
});

// @desc    Update single subscriber status (Admin)
// @route   PATCH /api/newsletter/subscribers/:id/status
// @access  Private/Admin
export const updateSubscriberStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !["active", "unsubscribed"].includes(status.toLowerCase())) {
        throw new ApiError(400, "Invalid status. Must be 'active' or 'unsubscribed'.");
    }

    const subscriber = await NewsletterSubscriber.findById(id);

    if (!subscriber) {
        throw new ApiError(404, "Subscriber not found.");
    }

    const newStatus = status.toLowerCase();
    subscriber.status = newStatus;

    if (newStatus === "unsubscribed") {
        subscriber.unsubscribedAt = new Date();
    } else {
        subscriber.subscribedAt = new Date();
        subscriber.unsubscribedAt = null;
    }

    await subscriber.save();

    return res.status(200).json(
        new ApiResponse(200, true, `Subscriber status updated to ${newStatus}`, subscriber)
    );
});

// @desc    Bulk update status for selected subscribers (Admin)
// @route   POST /api/newsletter/subscribers/bulk-status
// @access  Private/Admin
export const bulkUpdateStatus = asyncHandler(async (req, res) => {
    const { ids, status } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
        throw new ApiError(400, "Please select at least one subscriber.");
    }

    if (!status || !["active", "unsubscribed"].includes(status.toLowerCase())) {
        throw new ApiError(400, "Invalid status. Must be 'active' or 'unsubscribed'.");
    }

    const newStatus = status.toLowerCase();
    const updatePayload = newStatus === "unsubscribed"
        ? { status: "unsubscribed", unsubscribedAt: new Date() }
        : { status: "active", subscribedAt: new Date(), unsubscribedAt: null };

    const result = await NewsletterSubscriber.updateMany(
        { _id: { $in: ids } },
        { $set: updatePayload }
    );

    return res.status(200).json(
        new ApiResponse(200, true, `Successfully updated ${result.modifiedCount} subscribers to ${newStatus}.`)
    );
});

// @desc    Delete single subscriber (Admin)
// @route   DELETE /api/newsletter/subscribers/:id
// @access  Private/Admin
export const deleteSubscriber = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const subscriber = await NewsletterSubscriber.findByIdAndDelete(id);

    if (!subscriber) {
        throw new ApiError(404, "Subscriber not found.");
    }

    return res.status(200).json(
        new ApiResponse(200, true, "Subscriber deleted successfully.")
    );
});

// @desc    Bulk delete selected subscribers (Admin)
// @route   POST /api/newsletter/subscribers/bulk-delete
// @access  Private/Admin
export const bulkDelete = asyncHandler(async (req, res) => {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
        throw new ApiError(400, "Please select at least one subscriber to delete.");
    }

    const result = await NewsletterSubscriber.deleteMany({ _id: { $in: ids } });

    return res.status(200).json(
        new ApiResponse(200, true, `Successfully deleted ${result.deletedCount} subscribers.`)
    );
});

// @desc    Export subscribers as CSV (Admin - All or Selected)
// @route   GET /api/newsletter/export
// @access  Private/Admin
export const exportSubscribersCsv = asyncHandler(async (req, res) => {
    const { status, search, ids } = req.query;

    let query = {};

    if (ids && ids.trim()) {
        const idList = ids.split(",").map((i) => i.trim()).filter(Boolean);
        if (idList.length > 0) {
            query._id = { $in: idList };
        }
    } else {
        if (status && status !== "All") {
            query.status = status.toLowerCase();
        }

        if (search && search.trim()) {
            query.email = new RegExp(search.trim(), "i");
        }
    }

    const subscribers = await NewsletterSubscriber.find(query).sort({ createdAt: -1 });

    const csvRows = [
        "Email,Status,Subscribed At,Unsubscribed At,Created At"
    ];

    subscribers.forEach((sub) => {
        const email = `"${sub.email.replace(/"/g, '""')}"`;
        const statusVal = `"${sub.status}"`;
        const subAt = sub.subscribedAt ? `"${new Date(sub.subscribedAt).toISOString()}"` : '""';
        const unsubAt = sub.unsubscribedAt ? `"${new Date(sub.unsubscribedAt).toISOString()}"` : '""';
        const createdAt = sub.createdAt ? `"${new Date(sub.createdAt).toISOString()}"` : '""';

        csvRows.push(`${email},${statusVal},${subAt},${unsubAt},${createdAt}`);
    });

    const csvData = csvRows.join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="newsletter_subscribers.csv"');
    return res.status(200).send(csvData);
});
