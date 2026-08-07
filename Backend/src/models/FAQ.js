import mongoose from "mongoose";

const faqSchema = new mongoose.Schema(
    {
        question: {
            type: String,
            required: true,
            trim: true
        },
        answer: {
            type: String,
            required: true,
            trim: true
        },
        category: {
            type: String,
            enum: ["financing", "booking", "sell-process", "warranty", "location", "import-export"],
            required: true
        },
        keywords: [
            {
                type: String,
                trim: true
            }
        ]
    },
    {
        timestamps: true
    }
);

const FAQ = mongoose.model("FAQ", faqSchema);

export default FAQ;
