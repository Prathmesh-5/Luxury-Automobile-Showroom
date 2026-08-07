import mongoose from "mongoose";

const leadSchema = new mongoose.Schema(
{
    carId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Car",
        required: true
    },

    name: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        trim: true
    },

    phone: {
        type: String,
        required: true,
        trim: true
    },

    message: {
        type: String,
        default: ""
    },

    status: {
        type: String,
        enum: ["New", "Contacted", "Closed"],
        default: "New"
    }

},
{
    timestamps: true
});

const Lead = mongoose.model("Lead", leadSchema);

export default Lead;