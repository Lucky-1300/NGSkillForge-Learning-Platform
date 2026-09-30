const express = require("express");
const router = express.Router();
const { optionalAuthMiddleware } = require("../middleware/auth.middleware");

const {
    getLecturesByCourse,
    getLectureByNumber,
    toggleLectureComplete,
    importPlaylistLectures,
} = require("../controllers/lecture.controller");

// Route to get all lectures for a course (with modules & progress)
router.get("/course/:courseId", optionalAuthMiddleware, getLecturesByCourse);

// Route to get a specific lecture with rich notes, tasks, MCQs, and navigation
router.get("/course/:courseId/:lectureNumber", optionalAuthMiddleware, getLectureByNumber);

// Route to toggle lecture completion
router.post("/course/:courseId/:lectureNumber/toggle-complete", optionalAuthMiddleware, toggleLectureComplete);

// Route to import playlist lectures
router.post("/import-playlist", importPlaylistLectures);

module.exports = router;
