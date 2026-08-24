// This file handles course create, read, update, delete, search, and pagination.
const Course = require("../models/course.model");
const Enrollment = require("../models/enrollment.model");

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

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

        const filter = {};

        // Search by course title if the user passes ?search=...
        if (search) {
            filter.title = {
                $regex: escapeRegex(search),
                $options: "i",
            };
        }

        // Filter courses by category if ?category=... is provided.
        if (category) {
            filter.category = category;
        }

        if (req.query.level) {
            filter.level = req.query.level;
        }

        // Keep full lesson content out of the public catalog payload.
        const courses = await Course.find(filter)
            .select("-modules")
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
        // Keep full lesson content out of the public course detail payload.
        const course = await Course.findById(req.params.id)
            .select("-modules");

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

const getCourseContent = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id)
            .select("title description instructor category level duration modules");

        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found",
            });
        }

        const isAdmin = req.user?.role === "admin";

        let isEnrolled = false;
        if (!isAdmin) {
            const enrollment = await Enrollment.findOne({
                user: req.user.id,
                course: req.params.id,
            }).select("_id");

            isEnrolled = Boolean(enrollment);
        }

        if (!isAdmin && !isEnrolled) {
            return res.status(403).json({
                success: false,
                message: "Access denied. Enroll in this course to view content",
            });
        }

        return res.status(200).json({
            success: true,
            course: {
                _id: course._id,
                title: course.title,
                description: course.description,
                instructor: course.instructor,
                category: course.category,
                level: course.level,
                duration: course.duration,
                modules: course.modules,
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch course content",
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
    getCourseContent,
    updateCourse,
    deleteCourse,
};
