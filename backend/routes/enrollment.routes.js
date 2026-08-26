// This file contains enrollment API routes.
const express = require("express");

const router = express.Router();

const {
    enrollCourse,
    getMyEnrollments,
    toggleLessonCompletion,
    toggleQuestionCompletion,
    toggleTaskCompletion,
} = require("../controllers/enrollment.controller");

const authMiddleware = require("../middleware/auth.middleware");
const { validateEnrollment } = require("../middleware/validation.middleware");



router.post(
    "/enroll-course",
    authMiddleware,
    validateEnrollment,
    enrollCourse
);



router.post(
    "/complete-lesson",
    authMiddleware,
    toggleLessonCompletion
);



router.post(
    "/complete-question",
    authMiddleware,
    toggleQuestionCompletion
);



router.post(
    "/complete-task",
    authMiddleware,
    toggleTaskCompletion
);



router.get(
    "/my-enrollments",
    authMiddleware,
    getMyEnrollments
);



module.exports = router;