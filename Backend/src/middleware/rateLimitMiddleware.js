import rateLimit from "express-rate-limit";

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 2000,
    message: {
        success: false,
        message: "Too many requests, please try again later."
    },
    standardHeaders: true,
    legacyHeaders: false
});

export const newsletterLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes window
    max: 20, // 20 subscription attempts per IP per 15 minutes
    message: {
        success: false,
        message: "Too many newsletter subscription attempts from this IP. Please try again later."
    },
    standardHeaders: true,
    legacyHeaders: false
});

export default limiter;