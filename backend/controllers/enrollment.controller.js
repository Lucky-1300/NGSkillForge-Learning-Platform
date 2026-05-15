const Enrollment = require("../models/enrollment.model");

const Course = require("../models/course.model");


const enrollCourse = async (req, res) => {

    try {

        const { courseId } = req.body;



        const course = await Course.findById(courseId);

        if (!course) {

            return res.status(404).json({
                success: false,
                message: "Course not found",
            });

        }



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