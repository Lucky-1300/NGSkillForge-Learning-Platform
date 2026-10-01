const express = require("express");
const router = express.Router();
const {
    getCourseNotes,
    getTopicNote,
} = require("../controllers/courseNote.controller");

// Get all notes & topics for a course
router.get("/course/:courseId", getCourseNotes);

// Get single topic note
router.get("/course/:courseId/topics/:topicId", getTopicNote);

module.exports = router;
