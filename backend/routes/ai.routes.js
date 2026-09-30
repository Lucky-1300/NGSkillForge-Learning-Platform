const express = require("express");
const router = express.Router();
const {
    generateNotes,
    generateTasks,
    generateMCQs,
    generateSelectedContent,
    getCourseContentStatus,
    publishCourseContent,
    updateLectureContent,
    getLectureTranscriptHandler,
    refreshLectureTranscriptHandler,
    getLectureContentDraft,
    publishLectureContent,
    askLectureAI,
    testAI,
    getAIStatus,
} = require("../controllers/ai.controller");

const { optionalAuthMiddleware } = require("../middleware/auth.middleware");

/**
 * AI Service Routes
 * Base Path: /api/ai
 */

// Student-facing Lecture AI Assistant & Tutor (with optional authentication)
router.post("/lecture/:lectureId/ask", optionalAuthMiddleware, askLectureAI);
router.post("/ask-lecture", optionalAuthMiddleware, askLectureAI);
router.post("/ask", optionalAuthMiddleware, askLectureAI);

// Admin AI Content Generation Pipeline
router.post("/generate-content", generateSelectedContent);
router.post("/generate-notes", generateNotes);
router.post("/generate-tasks", generateTasks);
router.post("/generate-mcqs", generateMCQs);

// Course Level AI Status & Publishing
router.get("/course-status/:courseId", getCourseContentStatus);
router.post("/publish-course-content/:courseId", publishCourseContent);

// YouTube Transcript Endpoints
router.get("/transcript/:lectureId", getLectureTranscriptHandler);
router.post("/fetch-transcript/:lectureId", refreshLectureTranscriptHandler);

// Draft Review, Update & Publishing Pipeline
router.get("/content/:lectureId", getLectureContentDraft);
router.put("/content/:lectureId", updateLectureContent);
router.post("/publish-content/:lectureId", publishLectureContent);

// Test & Status Endpoints
router.post("/test", testAI);
router.get("/status", getAIStatus);

module.exports = router;
