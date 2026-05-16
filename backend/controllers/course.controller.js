// This file handles course create, read, update, delete, search, and pagination.
const Course = require("../models/course.model")






const createCourse = async (req, res) => {

    try {

        // Save the course exactly as sent in the request body.
        const course = await Course.create(req.body);

        return res.status(201).json({
            success: true,
            message: "Course created successfully",
            course,
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: "Failed to create course",
            error: error.message,
        });

    }

};


const getAllCourses = async (req, res) => {

    try {

        // Read pagination and search values from the query string.
        const page = Number(req.query.page) || 1;

        const limit = Number(req.query.limit) || 5;

        const skip = (page - 1) * limit;

        const search = req.query.search || "";

        const category = req.query.category || "";



        let filter = {};



        // Search by course title if the user passes ?search=...
        if (search) {
            filter.title = {
                $regex: search,
                $options: "i",
            };
        }



        // Filter courses by category if ?category=... is provided.
        if (category) {
            filter.category = category;
        }



        const courses = await Course.find(filter)
        .skip(skip)
        .limit(limit);



        const totalCourses = await Course.countDocuments(filter);



        return res.status(200).json({
            success: true,
            totalCourses,
            currentPage: page,
            totalPages: Math.ceil(totalCourses / limit),
            courses,
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: "Failed to fetch courses",
            error: error.message,
        });

    }

};



const getSingleCourse = async (req, res) => {

    try {

        // Find one course by its MongoDB id.
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found",
            });
        }

        return res.status(200).json({
            success: true,
            course,
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: "Failed to fetch course",
            error: error.message,
        });

    }

};




const updateCourse = async (req, res) => {

    try {

        // Update only the fields that come in the request body.
        const updatedCourse = await Course.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
            }
        );

        if (!updatedCourse) {
            return res.status(404).json({
                success: false,
                message: "Course not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Course updated successfully",
            updatedCourse,
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: "Failed to update course",
            error: error.message,
        });

    }

};



const deleteCourse = async (req, res) => {

    try {

        // Remove the course from MongoDB using its id.
        const deletedCourse = await Course.findByIdAndDelete(
            req.params.id
        );

        if (!deletedCourse) {
            return res.status(404).json({
                success: false,
                message: "Course not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Course deleted successfully",
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: "Failed to delete course",
            error: error.message,
        });

    }

};



module.exports = {
    createCourse,
    getAllCourses,
    getSingleCourse,
    updateCourse,
    deleteCourse,
};