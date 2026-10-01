const CourseNote = require("../models/courseNote.model");
const Course = require("../models/course.model");
const defaultHtmlNotes = require("../seed/data/html_notes_data.json");

/**
 * Get all notes and topics for a course
 * GET /api/notes/course/:courseId
 */
exports.getCourseNotes = async (req, res) => {
    try {
        const { courseId } = req.params;
        const isObjectId = /^[0-9a-fA-F]{24}$/.test(courseId);
        let course = null;
        if (isObjectId) {
            course = await Course.findById(courseId).select("title category slug");
        }

        // Build search conditions safely without triggering CastError
        const queryOr = [{ courseSlug: courseId.toLowerCase() }];
        if (isObjectId) {
            queryOr.push({ courseId: courseId });
        }
        if (course) {
            queryOr.push({ courseId: course._id });
        }

        let notesDoc = await CourseNote.findOne({ $or: queryOr }).lean();

        // Fallback for HTML course if not yet seeded
        if (!notesDoc && (course?.title?.toLowerCase().includes("html") || courseId === "html")) {
            return res.status(200).json({
                success: true,
                courseId: course ? course._id : courseId,
                courseTitle: course ? course.title : "HTML5 Foundations",
                courseSlug: "html",
                topics: defaultHtmlNotes.topics,
                totalTopics: defaultHtmlNotes.topics.length,
            });
        }

        if (!notesDoc) {
            return res.status(404).json({
                success: false,
                message: "No course notes available for this course yet.",
                topics: [],
            });
        }

        return res.status(200).json({
            success: true,
            courseId: notesDoc.courseId,
            courseTitle: notesDoc.courseTitle,
            courseSlug: notesDoc.courseSlug,
            topics: notesDoc.topics,
            totalTopics: notesDoc.topics.length,
        });
    } catch (error) {
        console.error("Error fetching course notes:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to load course notes",
            error: error.message,
        });
    }
};

/**
 * Get a specific topic note for a course
 * GET /api/notes/course/:courseId/topics/:topicId
 */
exports.getTopicNote = async (req, res) => {
    try {
        const { courseId, topicId } = req.params;
        const isObjectId = /^[0-9a-fA-F]{24}$/.test(courseId);
        let course = null;
        if (isObjectId) {
            course = await Course.findById(courseId).select("title category");
        }

        const queryOr = [{ courseSlug: courseId.toLowerCase() }];
        if (isObjectId) {
            queryOr.push({ courseId: courseId });
        }
        if (course) {
            queryOr.push({ courseId: course._id });
        }

        let notesDoc = await CourseNote.findOne({ $or: queryOr }).lean();

        let topic = null;
        if (notesDoc) {
            topic = notesDoc.topics.find(
                (t) => t.topicId === topicId || String(t.order) === topicId
            );
        } else if (course?.title?.toLowerCase().includes("html") || courseId === "html") {
            topic = defaultHtmlNotes.topics.find(
                (t) => t.topicId === topicId || String(t.order) === topicId
            );
        }

        if (!topic) {
            return res.status(404).json({
                success: false,
                message: "Topic note not found",
            });
        }

        return res.status(200).json({
            success: true,
            topic,
        });
    } catch (error) {
        console.error("Error fetching topic note:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to load topic note",
            error: error.message,
        });
    }
};
