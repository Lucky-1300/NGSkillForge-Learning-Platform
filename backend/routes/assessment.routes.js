const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const { optionalAuthMiddleware } = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");
const {
    getCourseAssessmentStudent,
    getAssessmentByIdStudent,
    startAssessmentAttempt,
    submitAssessmentAttempt,
    getMyAttempts,
    getCourseCompletionStatus,
    getAdminAssessments,
    getAdminAssessmentById,
    createAdminAssessment,
    updateAdminAssessment,
    publishAdminAssessment,
    unpublishAdminAssessment,
    deleteAdminAssessment,
} = require("../controllers/assessment.controller");

// ==========================================
// STUDENT ASSESSMENT ROUTES
// ==========================================

// Fetch published course assessment & prerequisite info
router.get("/course/:courseId", optionalAuthMiddleware, getCourseAssessmentStudent);

// Fetch course completion and lecture progress status
router.get("/course/:courseId/completion", optionalAuthMiddleware, getCourseCompletionStatus);

// Fetch specific published assessment
router.get("/:assessmentId", optionalAuthMiddleware, getAssessmentByIdStudent);

// Start assessment attempt (requires auth)
router.post("/:assessmentId/start", authMiddleware, startAssessmentAttempt);

// Submit assessment answers (requires auth)
router.post("/:assessmentId/submit", authMiddleware, submitAssessmentAttempt);

// Get user's previous attempts for an assessment
router.get("/:assessmentId/my-attempts", authMiddleware, getMyAttempts);

module.exports = router;
