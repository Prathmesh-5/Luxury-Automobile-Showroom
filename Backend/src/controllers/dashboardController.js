import Car from "../models/Car.js";
import Brand from "../models/Brand.js";
import Lead from "../models/Lead.js";
import TestDrive from "../models/TestDrive.js";
import asyncHandler from "../middleware/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/apiResponse.js";

export const getDashboardStats = asyncHandler(async (req, res) => {

    

        const totalCars = await Car.countDocuments();

        const totalBrands = await Brand.countDocuments();

        const totalLeads = await Lead.countDocuments();

        const totalTestDrives = await TestDrive.countDocuments();

        const recentCars = await Car.find()
        .sort("-createdAt")
        .limit(5);

        const recentLeads = await Lead.find()
        .populate("carId", "name model")
        .sort("-createdAt")
        .limit(5);

        const recentTestDrives = await TestDrive.find()
        .populate("carId", "name model")
        .sort("-createdAt")
        .limit(5);

        const featuredCars = await Car.countDocuments({
            featured: true
        });

        const carsByBrand = await Car.aggregate([
    {
        $lookup: {
            from: "brands",
            localField: "brandId",
            foreignField: "_id",
            as: "brand"
        }
    },
    {
        $unwind: "$brand"
    },
    {
        $group: {
            _id: "$brand.name",
            totalCars: {
                $sum: 1
            }
        }
    },
    {
        $sort: {
            totalCars: -1
        }
    }
]);

const monthlyLeads = await Lead.aggregate([
    {
        $group: {
            _id: {
                month: {
                    $month: "$createdAt"
                },
                year: {
                    $year: "$createdAt"
                }
            },
            totalLeads: {
                $sum: 1
            }
        }
    },
    {
        $sort: {
            "_id.year": 1,
            "_id.month": 1
        }
    }
]);

const monthlyTestDrives = await TestDrive.aggregate([
    {
        $group: {
            _id: {
                month: {
                    $month: "$createdAt"
                },
                year: {
                    $year: "$createdAt"
                }
            },
            totalBookings: {
                $sum: 1
            }
        }
    },
    {
        $sort: {
            "_id.year": 1,
            "_id.month": 1
        }
    }
]);
        res.status(200).json(
    new ApiResponse(
        200,
        true,
        "Dashboard data fetched successfully",
        {
            totalCars,
            totalBrands,
            totalLeads,
            totalTestDrives,
            featuredCars,
            recentCars,
            recentLeads,
            recentTestDrives,
            carsByBrand,
            monthlyLeads,
            monthlyTestDrives
        }
    )
);


});