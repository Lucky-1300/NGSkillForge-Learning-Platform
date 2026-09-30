const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");
const {
    getAdminContentList,
    getAdminLectureContent,
    updateAdminNotes,
    updateAdminTasks,
    updateAdminMCQs,
    saveAdminDraft,
    publishAdminContent,
    unpublishAdminContent,
    bulkPublishAdminContent,
    deleteAdminTask,
    deleteAdminMCQ,
} = require("../controllers/adminContent.controller");

// All admin content routes strictly require valid authentication + Admin role
router.use(authMiddleware);
router.use(roleMiddleware("admin"));

/**
 * Admin Content Dashboard & Overview
 * GET /api/admin/content
 */
router.get("/", getAdminContentList);

/**
 * Bulk Publish Lectures
 * POST /api/admin/content/bulk-publish
 */
router.post("/bulk-publish", bulkPublishAdminContent);

/**
 * Single Lecture Review & Edit
 * GET /api/admin/content/:lectureId
 */
router.get("/:lectureId", getAdminLectureContent);

/**
 * Save Full Draft (Notes + Tasks + MCQs)
 * PUT /api/admin/content/:lectureId/draft
 * PUT /api/admin/content/:lectureId
 */
router.put("/:lectureId/draft", saveAdminDraft);
router.put("/:lectureId", saveAdminDraft);

/**
 * Granular Section Updates (Draft mode)
 * PUT /api/admin/content/:lectureId/notes
 * PUT /api/admin/content/:lectureId/tasks
 * PUT /api/admin/content/:lectureId/mcqs
 */
router.put("/:lectureId/notes", updateAdminNotes);
router.put("/:lectureId/tasks", updateAdminTasks);
router.put("/:lectureId/mcqs", updateAdminMCQs);

/**
 * Explicit Publishing & Unpublishing
 * POST /api/admin/content/:lectureId/publish
 * POST /api/admin/content/:lectureId/unpublish
 */
router.post("/:lectureId/publish", publishAdminContent);
router.post("/:lectureId/unpublish", unpublishAdminContent);

/**
 * Delete Individual Tasks or MCQs from Draft
 * DELETE /api/admin/content/:lectureId/tasks/:taskId
 * DELETE /api/admin/content/:lectureId/mcqs/:mcqId
 */
router.delete("/:lectureId/tasks/:taskId", deleteAdminTask);
router.delete("/:lectureId/mcqs/:mcqId", deleteAdminMCQ);

module.exports = router;
