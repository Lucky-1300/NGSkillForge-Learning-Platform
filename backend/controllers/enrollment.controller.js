// This file handles course enrollment and getting a user's enrollments.
const Enrollment = require("../models/enrollment.model");

const Course = require("../models/course.model");


const enrollCourse = async (req, res) => {

    try {

        const { courseId } = req.body;



        // Make sure the course exists before enrolling the user.
        const course = await Course.findById(courseId);

        if (!course) {

            return res.status(404).json({
                success: false,
                message: "Course not found",
            });

        }



        // Stop the user from enrolling in the same course more than once.
        const existingEnrollment =
        await Enrollment.findOne({
            user: req.user.id,
            course: courseId,
        });



        if (existingEnrollment) {

            return res.status(400).json({
                success: false,
                message: "Already enrolled",
            });

        }



        // Create the enrollment record with the logged-in user's id.
        const enrollment = await Enrollment.create({
            user: req.user.id,
            course: courseId,
        });



        return res.status(201).json({
            success: true,
            message: "Enrollment successful",
            enrollment,
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: "Enrollment failed",
            error: error.message,
        });

    }

};





const getMyEnrollments = async (req, res) => {

    try {

        // Fetch only the enrollments that belong to the current user.
        const enrollments =
        await Enrollment.find({
            user: req.user.id,
        })
        .populate("course");



        return res.status(200).json({
            success: true,
            enrollments,
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: "Failed to fetch enrollments",
            error: error.message,
        });

    }

};



module.exports = {
    enrollCourse,
    getMyEnrollments,
};