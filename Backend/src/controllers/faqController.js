import FAQ from "../models/FAQ.js";
import asyncHandler from "../middleware/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/apiResponse.js";

// Get All FAQs
export const getAllFaqs = asyncHandler(async (req, res) => {
    const faqs = await FAQ.find();
    res.status(200).json(
        new ApiResponse(200, true, "FAQs fetched successfully", faqs)
    );
});

// Create FAQ
export const createFaq = asyncHandler(async (req, res) => {
    const { question, answer, category, keywords } = req.body;
    if (!question || !answer || !category) {
        throw new ApiError(400, "Question, answer, and category are required");
    }

    const faq = await FAQ.create({
        question,
        answer,
        category,
        keywords: keywords || []
    });

    res.status(201).json(
        new ApiResponse(201, true, "FAQ created successfully", faq)
    );
});

// Update FAQ
export const updateFaq = asyncHandler(async (req, res) => {
    const { question, answer, category, keywords } = req.body;

    const faq = await FAQ.findById(req.params.id);
    if (!faq) {
        throw new ApiError(404, "FAQ not found");
    }

    faq.question = question !== undefined ? question : faq.question;
    faq.answer = answer !== undefined ? answer : faq.answer;
    faq.category = category !== undefined ? category : faq.category;
    faq.keywords = keywords !== undefined ? keywords : faq.keywords;

    await faq.save();

    res.status(200).json(
        new ApiResponse(200, true, "FAQ updated successfully", faq)
    );
});

// Delete FAQ
export const deleteFaq = asyncHandler(async (req, res) => {
    const faq = await FAQ.findByIdAndDelete(req.params.id);
    if (!faq) {
        throw new ApiError(404, "FAQ not found");
    }

    res.status(200).json(
        new ApiResponse(200, true, "FAQ deleted successfully")
    );
});
