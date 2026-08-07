import mongoose from "mongoose";

const testDriveSchema = new mongoose.Schema(
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

    preferredDate: {
        type: Date,
        required: true
    },

    preferredTime: {
        type: String,
        required: true
    },

    status: {
        type: String,
        enum: ["Pending", "Confirmed", "Completed", "Cancelled"],
        default: "Pending"
    }

},
{
    timestamps: true
});

const TestDrive = mongoose.model("TestDrive", testDriveSchema);

export default TestDrive;