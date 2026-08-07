import mongoose from "mongoose";

const carSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    brandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
    },

    model: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    year: {
      type: Number,
      required: true,
    },

    condition: {
      type: String,
      enum: ["New", "Used"],
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    currency: {
      type: String,
      default: "INR",
    },

    priceOnCall: {
      type: Boolean,
      default: false,
    },

    mileage: {
      type: Number,
      default: 0,
    },

    engine: {
      type: String,
    },

    transmission: {
      type: String,
      enum: ["Automatic", "Manual"],
    },

    fuelType: {
      type: String,
      enum: ["Petrol", "Diesel", "Hybrid", "Electric"],
    },

    status: {
      type: String,
      enum: ["Available", "Sold", "Reserved"],
      default: "Available",
    },

    featured: {
      type: Boolean,
      default: false,
    },
    featuredPriority: {
      type: Number,
      default: 9999,
      min: [1, "Featured priority must be at least 1"],
    },
    images: [
    {
        type: String
    }
    ],
  },
  {
    timestamps: true,
  }
);

const Car = mongoose.model("Car", carSchema);

export default Car;