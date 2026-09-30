const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const { optionalAuthMiddleware } = require("../middleware/auth.middleware");

const {
    markLectureComplete,
    toggleLectureComplete,
    recordLectureAccess,
    getCourseProgress,
    getLectureProgress,
} = require("../controllers/progress.controller");

// Mark lecture as completed / incompleted
router.post("/lecture/:lectureId/complete", authMiddleware, markLectureComplete);

// Toggle lecture completion
router.post("/lecture/:lectureId/toggle", authMiddleware, toggleLectureComplete);

// Record lecture access (updates lastAccessedAt timestamp)
router.post("/lecture/:lectureId/access", optionalAuthMiddleware, recordLectureAccess);

// Get course progress summary, module progress, and continue learning lecture
router.get("/course/:courseId", optionalAuthMiddleware, getCourseProgress);

// Get progress status for a specific lecture
router.get("/lecture/:lectureId", authMiddleware, getLectureProgress);

module.exports = router;
