// This file contains course API routes.
const express = require("express");

const router = express.Router();

const {
    createCourse,
    getAllCourses,
    getSingleCourse,
    getCourseContent,
    updateCourse,
    deleteCourse,
} = require("../controllers/course.controller");

const authMiddleware = require("../middleware/auth.middleware");

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