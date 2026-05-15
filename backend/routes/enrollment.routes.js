const express = require("express");

const router = express.Router();

const {
    enrollCourse,
    getMyEnrollments,
} = require("../controllers/enrollment.controller");

const authMiddleware = require("../middleware/auth.middleware");



router.post(
    "/enroll-course",
    authMiddleware,
    enrollCourse
);



router.get(
    "/my-enrollments",
    authMiddleware,
    getMyEnrollments
);



module.exports = router;