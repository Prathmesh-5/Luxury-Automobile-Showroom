import Car from "../models/Car.js";
import asyncHandler from "../middleware/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/apiResponse.js";

// Create Car
export const createCar = asyncHandler(async (req, res) => {
    
        const car = await Car.create({
            ...req.body,
            images: req.body.images || []
        });

        res.status(201).json(
            new ApiResponse(
                201,
                true,
                "Car Added Successfully",
                car
            )
        );
    
});

// Get All Cars
export const getAllCars = asyncHandler(async (req, res) => {

        const search = req.query.search || "";
        const brandId = req.query.brandId || "";
        const condition = req.query.condition || "";
        const status = req.query.status || "";
        const minPrice = req.query.minPrice || "";
        const maxPrice = req.query.maxPrice || "";
        const year = req.query.year || "";
        const sort = req.query.sort || "";

        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;

        const filter = {};

        // Search Filter
        if (search) {
            filter.$or = [
                {
                    name: {
                        $regex: search,
                        $options: "i"
                    }
                },
                {
                    model: {
                        $regex: search,
                        $options: "i"
                    }
                }
            ];
        }

        // Brand Filter
        if (brandId) {
            filter.brandId = brandId;
        }

        // Condition Filter
        if (condition) {
            filter.condition = condition;
        }

        // Status Filter
        if (status) {
            filter.status = status;
        }

        // Price Filter
        if (minPrice || maxPrice) {

            filter.price = {};
            if (minPrice) {
                filter.price.$gte = Number(minPrice);
            }
            if (maxPrice) {
                filter.price.$lte = Number(maxPrice);
            }

        }

        // Year Filter
        if (year) {
            filter.year = Number(year);
        }

        // Featured Filter
        const featured = req.query.featured;
        if (featured === "true" || featured === true) {
            filter.featured = true;
        }

        let query = Car.find(filter).populate(
            "brandId",
            "name country logo"
        );

        if (featured === "true" || featured === true) {
            let sortStr = "featuredPriority";
            if (sort) {
                sortStr += " " + sort;
            }
            query = query.sort(sortStr);
        } else if (sort) {
            query = query.sort(sort);
        }

        const totalCars = await Car.countDocuments(filter);

        const cars = await query
        .skip((page - 1) * limit)
        .limit(limit);

        res.status(200).json({
            success: true,
            totalCars,
            currentPage: page,
            totalPages: Math.ceil(totalCars / limit),
            count: cars.length,
            data: cars
        });

    
});

// Get Car By ID
export const getCarById = asyncHandler(async (req, res) => {
    

        const car = await Car.findById(req.params.id).populate(
            "brandId",
            "name country logo description"
        );

        if (!car) {
            throw new ApiError(
                404,
                "Car Not Found"
            );
        }

        res.status(200).json(
            new ApiResponse(
                200,
                true,
                "Car fetched successfully",
                car
            )
        );

});

// Update Car
export const updateCar = asyncHandler(async (req, res) => {
    

        const updatedCar = await Car.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!updatedCar) {
            throw new ApiError(
                404,
                "Car Not Found"
            );
        }

        res.status(200).json({
            success: true,
            message: "Car Updated Successfully",
            data: updatedCar
        });

});


// Delete Car
export const deleteCar = asyncHandler(async (req, res) => {

        const deletedCar = await Car.findByIdAndDelete(req.params.id);

        if (!deletedCar) {
            throw new ApiError(
                404,
                "Car Not Found"
            );
        }

        res.status(200).json({
            success: true,
            message: "Car Deleted Successfully"
        });

    
});

// Get Similar Cars
export const getSimilarCars = asyncHandler(async (req, res) => {
    
        const car = await Car.findById(req.params.id);

        if (!car) {
            throw new ApiError(
                404,
                "Car Not Found"
            );
        }

        const similarCars = await Car.find({
            brandId: car.brandId,
            _id: { $ne: car._id }
        })
        .populate("brandId", "name country logo")
        .limit(4);

        res.status(200).json({
            success: true,
            count: similarCars.length,
            data: similarCars
        });

    
});