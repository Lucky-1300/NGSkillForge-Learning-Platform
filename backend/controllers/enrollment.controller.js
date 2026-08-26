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



const toggleLessonCompletion = async (req, res) => {
    try {
        const { courseId, lessonKey, completed } = req.body;

        if (!courseId || !lessonKey) {
            return res.status(400).json({
                success: false,
                message: "courseId and lessonKey are required",
            });
        }

        const enrollment = await Enrollment.findOne({
            user: req.user.id,
            course: courseId,
        });

        if (!enrollment) {
            return res.status(404).json({
                success: false,
                message: "Enrollment not found for this course",
            });
        }

        const course = await Course.findById(courseId);
        let totalLessons = 0;
        if (course && course.modules) {
            course.modules.forEach((mod) => {
                totalLessons += mod.lessons?.length || 0;
            });
        }
        if (totalLessons === 0) totalLessons = 1;

        let completedLessons = enrollment.completedLessons || [];
        const isCurrentlyCompleted = completedLessons.includes(lessonKey);
        const shouldComplete = completed !== undefined ? Boolean(completed) : !isCurrentlyCompleted;

        if (shouldComplete && !isCurrentlyCompleted) {
            completedLessons.push(lessonKey);
        } else if (!shouldComplete && isCurrentlyCompleted) {
            completedLessons = completedLessons.filter((k) => k !== lessonKey);
        }

        const progress = Math.min(100, Math.round((completedLessons.length / totalLessons) * 100));

        enrollment.completedLessons = completedLessons;
        enrollment.progress = progress;
        await enrollment.save();

        return res.status(200).json({
            success: true,
            message: shouldComplete ? "Lesson marked as complete" : "Lesson marked as incomplete",
            isCompleted: shouldComplete,
            completedLessons,
            progress,
            totalLessons,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to update lesson completion",
            error: error.message,
        });
    }
};

const toggleQuestionCompletion = async (req, res) => {
    try {
        const { courseId, questionId, completed } = req.body;

        if (!courseId || !questionId) {
            return res.status(400).json({
                success: false,
                message: "courseId and questionId are required",
            });
        }

        const enrollment = await Enrollment.findOne({
            user: req.user.id,
            course: courseId,
        });

        if (!enrollment) {
            return res.status(404).json({
                success: false,
                message: "Enrollment not found for this course",
            });
        }

        let completedQuestions = enrollment.completedQuestions || [];
        const isCurrentlyCompleted = completedQuestions.includes(questionId);
        const shouldComplete = completed !== undefined ? Boolean(completed) : !isCurrentlyCompleted;

        if (shouldComplete && !isCurrentlyCompleted) {
            completedQuestions.push(questionId);
        } else if (!shouldComplete && isCurrentlyCompleted) {
            completedQuestions = completedQuestions.filter((q) => q !== questionId);
        }

        enrollment.completedQuestions = completedQuestions;
        await enrollment.save();

        return res.status(200).json({
            success: true,
            message: shouldComplete ? "Question marked as completed" : "Question marked as uncompleted",
            isCompleted: shouldComplete,
            completedQuestions,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to update question completion",
            error: error.message,
        });
    }
};

const toggleTaskCompletion = async (req, res) => {
    try {
        const { courseId, taskId, completed } = req.body;

        if (!courseId || !taskId) {
            return res.status(400).json({
                success: false,
                message: "courseId and taskId are required",
            });
        }

        const enrollment = await Enrollment.findOne({
            user: req.user.id,
            course: courseId,
        });

        if (!enrollment) {
            return res.status(404).json({
                success: false,
                message: "Enrollment not found for this course",
            });
        }

        let completedTasks = enrollment.completedTasks || [];
        const isCurrentlyCompleted = completedTasks.includes(taskId);
        const shouldComplete = completed !== undefined ? Boolean(completed) : !isCurrentlyCompleted;

        if (shouldComplete && !isCurrentlyCompleted) {
            completedTasks.push(taskId);
        } else if (!shouldComplete && isCurrentlyCompleted) {
            completedTasks = completedTasks.filter((t) => t !== taskId);
        }

        enrollment.completedTasks = completedTasks;
        await enrollment.save();

        return res.status(200).json({
            success: true,
            message: shouldComplete ? "Task marked as solved" : "Task marked as unsolved",
            isCompleted: shouldComplete,
            completedTasks,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to update task completion",
            error: error.message,
        });
    }
};

module.exports = {
    enrollCourse,
    getMyEnrollments,
    toggleLessonCompletion,
    toggleQuestionCompletion,
    toggleTaskCompletion,
};