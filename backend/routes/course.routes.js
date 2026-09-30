// This file contains course API routes.
const express = require("express");

const router = express.Router();

const {
    createCourse,
    getAllCourses,
    getSingleCourse,
    getCourseContent,
    getSubtopicLesson,
    getTopicDetails,
    updateCourse,
    deleteCourse,
} = require("../controllers/course.controller");
const { getCourseCompletionStatus } = require("../controllers/assessment.controller");

const { authMiddleware, optionalAuthMiddleware } = require("../middleware/auth.middleware");

const roleMiddleware = require("../middleware/role.middleware");
const {
    validateCourse,
    validateCourseUpdate,
    validateCourseQuery,
    validateObjectId,
} = require("../middleware/validation.middleware");



router.post(
    "/create-course",
    authMiddleware,
    roleMiddleware("admin"),
    validateCourse,
    createCourse
);



router.get(
    "/all-courses",
    validateCourseQuery,
    getAllCourses
);



router.get(
    "/single-course/:id",
    validateObjectId(),
    getSingleCourse
);


router.get(
    "/:courseId/topics/:topicId",
    optionalAuthMiddleware,
    getTopicDetails
);

router.get(
    "/:courseId/completion",
    optionalAuthMiddleware,
    getCourseCompletionStatus
);


router.get(
    "/:courseId/topics/:topicId/subtopics/:subtopicId",
    optionalAuthMiddleware,
    getSubtopicLesson
);


router.get(
    "/:id/content",
    authMiddleware,
    validateObjectId(),
    getCourseContent
);



router.put(
    "/update-course/:id",
    authMiddleware,
    roleMiddleware("admin"),
    validateObjectId(),
    validateCourseUpdate,
    updateCourse
);



router.delete(
    "/delete-course/:id",
    authMiddleware,
    roleMiddleware("admin"),
    validateObjectId(),
    deleteCourse
);



module.exports = router;