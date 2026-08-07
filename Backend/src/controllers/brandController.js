import Brand from "../models/Brand.js";
import asyncHandler from "../middleware/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/apiResponse.js";

// Create Brand
export const createBrand = asyncHandler(async (req, res) => {

        const brand = await Brand.create(req.body);

        res.status(201).json(
            new ApiResponse(
                201,
                true,
                "Brand Added Successfully",
                brand
            )
        );


});

// Get All Brands
export const getAllBrands = asyncHandler(async (req, res) => {

    const brands = await Brand.find().sort("name");

    res.status(200).json(
        new ApiResponse(
            200,
            true,
            "Brands fetched successfully",
            {
                count: brands.length,
                brands
            }
        )
    );

});

// Get Brand By ID
export const getBrandById = asyncHandler(async (req, res) => {

    const brand = await Brand.findById(req.params.id);

    if (!brand) {
        throw new ApiError(
            404,
            "Brand Not Found"
        );
    }

    res.status(200).json(
        new ApiResponse(
            200,
            true,
            "Brand fetched successfully",
            brand
        )
    );

});

// Update Brand
export const updateBrand = asyncHandler(async (req, res) => {

    const updatedBrand = await Brand.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
            new: true,
            runValidators: true
        }
    );

    if (!updatedBrand) {
        throw new ApiError(
            404,
            "Brand Not Found"
        );
    }

    res.status(200).json(
        new ApiResponse(
            200,
            true,
            "Brand Updated Successfully",
            updatedBrand
        )
    );

});

// Delete Brand
export const deleteBrand = asyncHandler(async (req, res) => {

    const deletedBrand = await Brand.findByIdAndDelete(
        req.params.id
    );

    if (!deletedBrand) {
        throw new ApiError(
            404,
            "Brand Not Found"
        );
    }

    res.status(200).json(
        new ApiResponse(
            200,
            true,
            "Brand Deleted Successfully"
        )
    );

});