// This file contains course API routes.
const express = require("express");

const router = express.Router();

const {
    createCourse,
    getAllCourses,
    getSingleCourse,
    updateCourse,
    deleteCourse,
} = require("../controllers/course.controller");

const authMiddleware = require("../middleware/auth.middleware");

const roleMiddleware = require("../middleware/role.middleware");



router.post(
    "/create-course",
    authMiddleware,
    roleMiddleware("admin"),
    createCourse
);



router.get(
    "/all-courses",
    getAllCourses
);



router.get(
    "/single-course/:id",
    getSingleCourse
);



router.put(
    "/update-course/:id",
    authMiddleware,
    roleMiddleware("admin"),
    updateCourse
);



router.delete(
    "/delete-course/:id",
    authMiddleware,
    roleMiddleware("admin"),
    deleteCourse
);



module.exports = router;