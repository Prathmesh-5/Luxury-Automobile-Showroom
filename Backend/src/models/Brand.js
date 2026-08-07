import mongoose from "mongoose";

const brandSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        logo: {
            type: String,
            default: ""
        },

        heroCar: {
            type: String,
            default: ""
        },

        foundedYear: {
            type: String,
            default: ""
        },

        country: {
            type: String,
            default: ""
        },

        description: {
            type: String,
            default: ""
        },

        overview: {
            type: String,
            default: ""
        },

        whyChoose: {
            type: [String],
            default: []
        },

        popularModels: {
            type: [String],
            default: []
        },

        performance: {
            speed: {
                type: String,
                default: ""
            },
            zero: {
                type: String,
                default: ""
            },
            hp: {
                type: String,
                default: ""
            },
            engine: {
                type: String,
                default: ""
            }
        },

        isActive: {
            type: Boolean,
            default: true
        }

    },
    {
        timestamps: true
    }
);

const Brand = mongoose.model("Brand", brandSchema);

export default Brand;