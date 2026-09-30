const mongoose = require("mongoose");
const Course = require("../models/course.model");
const Lecture = require("../models/lecture.model");
const LectureContent = require("../models/lectureContent.model");
const { resolveCourse, groupLecturesIntoModules } = require("../services/courseHelper");

/**
 * Validate Notes structure
 */
function validateNotes(notes, structuredNotes) {
    const errors = [];
    const title = structuredNotes?.title?.trim() || "";
    const hasNotesText = Boolean(notes && notes.trim());
    const hasSections = Boolean(
        structuredNotes?.sections &&
        Array.isArray(structuredNotes.sections) &&
        structuredNotes.sections.length > 0
    );

    if (!title && !hasNotesText) {
        errors.push("Notes require a non-empty title or content.");
    }
    if (!hasNotesText && !hasSections) {
        errors.push("Notes must have markdown content or at least one section.");
    }

    if (hasSections) {
        structuredNotes.sections.forEach((sec, idx) => {
            if (!sec.heading || !sec.heading.trim()) {
                errors.push(`Section ${idx + 1} is missing a heading.`);
            }
            if (!sec.content || !sec.content.trim()) {
                errors.push(`Section ${idx + 1} is missing content.`);
            }
        });
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
}

/**
 * Validate Practice Tasks structure
 */
function validateTasks(tasks) {
    const errors = [];
    if (!Array.isArray(tasks)) {
        return { isValid: false, errors: ["Tasks must be an array."] };
    }

    tasks.forEach((t, idx) => {
        const num = idx + 1;
        if (!t.title || !t.title.trim()) {
            errors.push(`Task #${num} is missing a title.`);
        }
        if (!t.description || !t.description.trim()) {
            errors.push(`Task #${num} is missing a description.`);
        }
        if (t.difficulty && !["Easy", "Medium", "Hard"].includes(t.difficulty)) {
            errors.push(`Task #${num} has invalid difficulty '${t.difficulty}'. Must be Easy, Medium, or Hard.`);
        }
    });

    return {
        isValid: errors.length === 0,
        errors,
    };
}

/**
 * Validate MCQs structure
 */
function validateMCQs(mcqs) {
    const errors = [];
    if (!Array.isArray(mcqs)) {
        return { isValid: false, errors: ["MCQs must be an array."] };
    }

    mcqs.forEach((q, idx) => {
        const num = idx + 1;
        if (!q.question || !q.question.trim()) {
            errors.push(`MCQ #${num} question text cannot be empty.`);
        }

        if (!Array.isArray(q.options) || q.options.length < 2) {
            errors.push(`MCQ #${num} must have at least 2 options.`);
        } else {
            const hasEmptyOpt = q.options.some((opt) => !opt || !String(opt).trim());
            if (hasEmptyOpt) {
                errors.push(`MCQ #${num} has one or more blank options.`);
            }

            const correctIdx = Number(q.correctAnswer);
            if (isNaN(correctIdx) || correctIdx < 0 || correctIdx >= q.options.length) {
                errors.push(`MCQ #${num} has an invalid correct answer index (${q.correctAnswer}). Must match an existing option.`);
            } else if (!q.options[correctIdx] || !String(q.options[correctIdx]).trim()) {
                errors.push(`MCQ #${num} correct answer option cannot be empty.`);
            }
        }

        if (q.difficulty && !["Easy", "Medium", "Hard"].includes(q.difficulty)) {
            errors.push(`MCQ #${num} has invalid difficulty '${q.difficulty}'.`);
        }
    });

    return {
        isValid: errors.length === 0,
        errors,
    };
}

/**
 * Validate full lecture content for publishing
 */
function validateContentForPublishing(content) {
    const allErrors = [];

    if (!content) {
        return { isValid: false, errors: ["No content found to publish."] };
    }

    // Check Notes
    const notesVal = validateNotes(content.notes, content.structuredNotes);
    if (!notesVal.isValid) {
        allErrors.push(...notesVal.errors);
    }

    // Check Tasks
    const tasksVal = validateTasks(content.tasks || []);
    if (!tasksVal.isValid) {
        allErrors.push(...tasksVal.errors);
    }

    // Check MCQs
    const mcqsVal = validateMCQs(content.mcqs || []);
    if (!mcqsVal.isValid) {
        allErrors.push(...mcqsVal.errors);
    }

    // Require at least Notes or Tasks or MCQs to be present
    const hasAnyContent = Boolean(
        (content.notes && content.notes.trim()) ||
        (content.tasks && content.tasks.length > 0) ||
        (content.mcqs && content.mcqs.length > 0)
    );

    if (!hasAnyContent) {
        allErrors.push("Cannot publish empty lecture content. Please generate or add Notes, Tasks, or MCQs.");
    }

    return {
        isValid: allErrors.length === 0,
        errors: allErrors,
    };
}

/**
 * Helper to compute status for individual components
 */
function computeComponentStatuses(contentDoc) {
    if (!contentDoc) {
        return {
            overallStatus: "missing",
            notesStatus: "missing",
            tasksStatus: "missing",
            mcqsStatus: "missing",
            notesCount: 0,
            tasksCount: 0,
            mcqsCount: 0,
        };
    }

    const isPublished = contentDoc.status === "published";
    const hasNotes = Boolean(contentDoc.notes && contentDoc.notes.trim());
    const tasksCount = contentDoc.tasks?.length || 0;
    const mcqsCount = contentDoc.mcqs?.length || 0;

    return {
        overallStatus: contentDoc.status || "draft",
        notesStatus: hasNotes ? (isPublished ? "published" : "draft") : "missing",
        tasksStatus: tasksCount > 0 ? (isPublished ? "published" : "draft") : "missing",
        mcqsStatus: mcqsCount > 0 ? (isPublished ? "published" : "draft") : "missing",
        notesCount: hasNotes ? 1 : 0,
        tasksCount,
        mcqsCount,
    };
}

/**
 * GET /api/admin/content
 * Returns list of courses, modules, and lectures with granular review & publishing statuses
 */
const getAdminContentList = async (req, res) => {
    try {
        const { courseId, moduleId, status, search } = req.query;

        // Fetch courses for selector
        const courses = await Course.find()
            .select("_id title category level duration thumbnail")
            .sort({ title: 1 });

        if (courses.length === 0) {
            return res.status(200).json({
                success: true,
                courses: [],
                lectures: [],
                stats: { total: 0, published: 0, draft: 0, missing: 0, failed: 0 },
            });
        }

        // Active selected course
        let activeCourse = null;
        if (courseId) {
            activeCourse = courses.find((c) => String(c._id) === String(courseId)) || courses[0];
        } else {
            activeCourse = courses[0];
        }

        // Fetch lectures for selected course
        let lectureQuery = { courseId: activeCourse._id };
        if (search && search.trim()) {
            lectureQuery.title = { $regex: search.trim(), $options: "i" };
        }

        const lectures = await Lecture.find(lectureQuery).sort({ lectureNumber: 1 });
        const lectureIds = lectures.map((l) => l._id);

        // Fetch all LectureContent records for these lectures
        const contentDocs = await LectureContent.find({
            lectureId: { $in: lectureIds },
        }).populate("reviewedBy publishedBy", "name email");

        const contentMap = new Map();
        contentDocs.forEach((doc) => {
            contentMap.set(String(doc.lectureId), doc);
        });

        // Group lectures into modules
        const modules = groupLecturesIntoModules(lectures, activeCourse);

        // Build augmented lecture items
        let augmentedLectures = lectures.map((lec) => {
            const contentDoc = contentMap.get(String(lec._id)) || null;
            const compStatus = computeComponentStatuses(contentDoc);
            const moduleInfo = modules.find(
                (m) => lec.lectureNumber >= m.startLecture && lec.lectureNumber <= m.endLecture
            ) || { moduleNumber: 1, title: "Module 1" };

            // Determine if transcript exists
            const hasTranscript = Boolean(
                contentDoc?.sourceContext?.transcriptAvailable ||
                contentDoc?.sourceContext?.hasTranscript ||
                lec.transcript?.text
            );

            return {
                _id: lec._id,
                lectureNumber: lec.lectureNumber,
                title: lec.title,
                duration: lec.duration,
                youtubeVideoId: lec.youtubeVideoId,
                youtubeUrl: lec.youtubeUrl,
                thumbnailUrl: lec.thumbnailUrl,
                moduleNumber: moduleInfo.moduleNumber,
                moduleTitle: moduleInfo.title,
                status: compStatus.overallStatus,
                notesStatus: compStatus.notesStatus,
                tasksStatus: compStatus.tasksStatus,
                mcqsStatus: compStatus.mcqsStatus,
                tasksCount: compStatus.tasksCount,
                mcqsCount: compStatus.mcqsCount,
                hasTranscript,
                reviewedBy: contentDoc?.reviewedBy || null,
                publishedBy: contentDoc?.publishedBy || null,
                publishedAt: contentDoc?.publishedAt || null,
                updatedAt: contentDoc?.updatedAt || lec.updatedAt,
            };
        });

        // Apply module filter if requested
        if (moduleId && moduleId !== "all") {
            const modNum = parseInt(moduleId, 10);
            if (!isNaN(modNum)) {
                augmentedLectures = augmentedLectures.filter((l) => l.moduleNumber === modNum);
            }
        }

        // Apply status filter if requested
        if (status && status !== "all") {
            if (status === "draft") {
                augmentedLectures = augmentedLectures.filter((l) => l.status === "draft");
            } else if (status === "published") {
                augmentedLectures = augmentedLectures.filter((l) => l.status === "published");
            } else if (status === "missing") {
                augmentedLectures = augmentedLectures.filter((l) => l.status === "missing");
            } else if (status === "failed") {
                augmentedLectures = augmentedLectures.filter((l) => l.status === "failed");
            }
        }

        // Compute aggregate stats for this course
        const allCourseContentDocs = await LectureContent.find({ courseId: activeCourse._id });
        const allCourseLectures = await Lecture.find({ courseId: activeCourse._id });
        const publishedCount = allCourseContentDocs.filter((d) => d.status === "published").length;
        const draftCount = allCourseContentDocs.filter((d) => d.status === "draft").length;
        const totalCount = allCourseLectures.length;
        const missingCount = Math.max(0, totalCount - (publishedCount + draftCount));

        return res.status(200).json({
            success: true,
            selectedCourse: activeCourse,
            courses,
            modules,
            lectures: augmentedLectures,
            stats: {
                total: totalCount,
                published: publishedCount,
                draft: draftCount,
                missing: missingCount,
                failed: 0,
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to load admin content review catalog",
            error: error.message,
        });
    }
};

/**
 * GET /api/admin/content/:lectureId
 * Returns single lecture detailed content for review and editing
 */
const getAdminLectureContent = async (req, res) => {
    try {
        const { lectureId } = req.params;

        let lecture = null;
        if (mongoose.Types.ObjectId.isValid(lectureId)) {
            lecture = await Lecture.findById(lectureId);
        }

        if (!lecture) {
            return res.status(404).json({
                success: false,
                message: "Lecture not found",
            });
        }

        const course = await Course.findById(lecture.courseId);
        const allCourseLectures = await Lecture.find({ courseId: lecture.courseId }).sort({ lectureNumber: 1 });
        const modules = groupLecturesIntoModules(allCourseLectures, course);
        const currentModule = modules.find(
            (m) => lecture.lectureNumber >= m.startLecture && lecture.lectureNumber <= m.endLecture
        ) || { moduleNumber: 1, title: "Module 1" };

        let content = await LectureContent.findOne({ lectureId: lecture._id })
            .populate("reviewedBy publishedBy", "name email role");

        // If no content document exists yet, initialize a draft template
        if (!content) {
            content = {
                lectureId: lecture._id,
                courseId: course._id,
                lectureNumber: lecture.lectureNumber,
                status: "draft",
                notes: "",
                structuredNotes: {
                    title: lecture.title,
                    overview: "",
                    sections: [],
                    importantPoints: [],
                    keyTakeaways: [],
                    usefulResources: [],
                },
                tasks: [],
                mcqs: [],
                reviewedBy: null,
                publishedBy: null,
                publishedAt: null,
                sourceContext: {},
            };
        }

        // Validate content to show real-time publishing readiness to admin
        const validation = validateContentForPublishing(content);

        return res.status(200).json({
            success: true,
            lecture: {
                _id: lecture._id,
                lectureNumber: lecture.lectureNumber,
                title: lecture.title,
                duration: lecture.duration,
                youtubeVideoId: lecture.youtubeVideoId,
                youtubeUrl: lecture.youtubeUrl,
                thumbnailUrl: lecture.thumbnailUrl,
            },
            course: {
                _id: course._id,
                title: course.title,
                category: course.category,
                level: course.level,
            },
            module: currentModule,
            content,
            validation,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to load lecture content for review",
            error: error.message,
        });
    }
};

/**
 * PUT /api/admin/content/:lectureId/notes
 * Update educational notes (Draft mode)
 */
const updateAdminNotes = async (req, res) => {
    try {
        const { lectureId } = req.params;
        const { notes, structuredNotes, importantPoints, keyTakeaways, usefulResources } = req.body;
        const userId = req.user?.id || req.user?._id;

        const lecture = await Lecture.findById(lectureId);
        if (!lecture) {
            return res.status(404).json({ success: false, message: "Lecture not found" });
        }

        // Validate notes
        const validation = validateNotes(notes, structuredNotes);

        const updateFields = {
            notes: notes || "",
            reviewedBy: userId,
            status: "draft", // Editing always keeps or moves working copy to draft
        };

        if (structuredNotes) updateFields.structuredNotes = structuredNotes;
        if (importantPoints) updateFields.importantPoints = importantPoints;
        if (keyTakeaways) updateFields.keyTakeaways = keyTakeaways;
        if (usefulResources) updateFields.usefulResources = usefulResources;

        const updated = await LectureContent.findOneAndUpdate(
            { lectureId: lecture._id },
            {
                $set: updateFields,
                $setOnInsert: {
                    courseId: lecture.courseId,
                    lectureNumber: lecture.lectureNumber,
                    generatedBy: "admin",
                },
            },
            { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
        ).populate("reviewedBy publishedBy", "name email");

        return res.status(200).json({
            success: true,
            message: "Notes saved as draft successfully",
            content: updated,
            validation,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to update notes",
            error: error.message,
        });
    }
};

/**
 * PUT /api/admin/content/:lectureId/tasks
 * Update practice tasks (Draft mode)
 */
const updateAdminTasks = async (req, res) => {
    try {
        const { lectureId } = req.params;
        const { tasks } = req.body;
        const userId = req.user?.id || req.user?._id;

        const lecture = await Lecture.findById(lectureId);
        if (!lecture) {
            return res.status(404).json({ success: false, message: "Lecture not found" });
        }

        const validation = validateTasks(tasks || []);
        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                message: "Task validation failed",
                errors: validation.errors,
            });
        }

        const updated = await LectureContent.findOneAndUpdate(
            { lectureId: lecture._id },
            {
                $set: {
                    tasks: tasks || [],
                    reviewedBy: userId,
                    status: "draft",
                },
                $setOnInsert: {
                    courseId: lecture.courseId,
                    lectureNumber: lecture.lectureNumber,
                    generatedBy: "admin",
                },
            },
            { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
        ).populate("reviewedBy publishedBy", "name email");

        return res.status(200).json({
            success: true,
            message: "Tasks saved as draft successfully",
            content: updated,
            validation,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to update tasks",
            error: error.message,
        });
    }
};

/**
 * PUT /api/admin/content/:lectureId/mcqs
 * Update MCQs with strict validation (Draft mode)
 */
const updateAdminMCQs = async (req, res) => {
    try {
        const { lectureId } = req.params;
        const { mcqs } = req.body;
        const userId = req.user?.id || req.user?._id;

        const lecture = await Lecture.findById(lectureId);
        if (!lecture) {
            return res.status(404).json({ success: false, message: "Lecture not found" });
        }

        const validation = validateMCQs(mcqs || []);
        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                message: "MCQ validation failed",
                errors: validation.errors,
            });
        }

        const updated = await LectureContent.findOneAndUpdate(
            { lectureId: lecture._id },
            {
                $set: {
                    mcqs: mcqs || [],
                    reviewedBy: userId,
                    status: "draft",
                },
                $setOnInsert: {
                    courseId: lecture.courseId,
                    lectureNumber: lecture.lectureNumber,
                    generatedBy: "admin",
                },
            },
            { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
        ).populate("reviewedBy publishedBy", "name email");

        return res.status(200).json({
            success: true,
            message: "MCQs saved as draft successfully",
            content: updated,
            validation,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to update MCQs",
            error: error.message,
        });
    }
};

/**
 * PUT /api/admin/content/:lectureId/draft
 * Save full draft (Notes + Tasks + MCQs) without publishing
 */
const saveAdminDraft = async (req, res) => {
    try {
        const { lectureId } = req.params;
        const { notes, structuredNotes, tasks, mcqs, importantPoints, keyTakeaways } = req.body;
        const userId = req.user?.id || req.user?._id;

        const lecture = await Lecture.findById(lectureId);
        if (!lecture) {
            return res.status(404).json({ success: false, message: "Lecture not found" });
        }

        const updateData = {
            status: "draft", // Strictly remains draft
            reviewedBy: userId,
        };

        if (notes !== undefined) updateData.notes = notes;
        if (structuredNotes !== undefined) updateData.structuredNotes = structuredNotes;
        if (tasks !== undefined) updateData.tasks = tasks;
        if (mcqs !== undefined) updateData.mcqs = mcqs;
        if (importantPoints !== undefined) updateData.importantPoints = importantPoints;
        if (keyTakeaways !== undefined) updateData.keyTakeaways = keyTakeaways;

        const updated = await LectureContent.findOneAndUpdate(
            { lectureId: lecture._id },
            {
                $set: updateData,
                $setOnInsert: {
                    courseId: lecture.courseId,
                    lectureNumber: lecture.lectureNumber,
                    generatedBy: "admin",
                },
            },
            { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
        ).populate("reviewedBy publishedBy", "name email");

        const validation = validateContentForPublishing(updated);

        return res.status(200).json({
            success: true,
            message: "Content changes saved as draft successfully",
            status: "draft",
            content: updated,
            validation,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to save draft content",
            error: error.message,
        });
    }
};

/**
 * POST /api/admin/content/:lectureId/publish
 * Validate and explicitly publish lecture content
 */
const publishAdminContent = async (req, res) => {
    try {
        const { lectureId } = req.params;
        const userId = req.user?.id || req.user?._id;

        const lecture = await Lecture.findById(lectureId);
        if (!lecture) {
            return res.status(404).json({ success: false, message: "Lecture not found" });
        }

        const content = await LectureContent.findOne({ lectureId: lecture._id });
        if (!content) {
            return res.status(400).json({
                success: false,
                message: "No draft content found to publish. Please generate or edit content first.",
            });
        }

        // Perform strict validation
        const validation = validateContentForPublishing(content);
        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                message: "Content failed validation and cannot be published.",
                errors: validation.errors,
            });
        }

        // Create approved snapshot for version safety
        const publishedSnapshot = {
            notes: content.notes,
            structuredNotes: content.structuredNotes,
            tasks: content.tasks,
            mcqs: content.mcqs,
            importantPoints: content.importantPoints,
            keyTakeaways: content.keyTakeaways,
            usefulResources: content.usefulResources,
            publishedAt: new Date(),
            publishedBy: userId,
        };

        content.status = "published";
        content.publishedBy = userId;
        content.reviewedBy = userId;
        content.publishedAt = new Date();
        content.publishedData = publishedSnapshot;

        await content.save();

        const populated = await LectureContent.findById(content._id)
            .populate("reviewedBy publishedBy", "name email");

        return res.status(200).json({
            success: true,
            message: `Lecture #${lecture.lectureNumber} content published successfully to live students.`,
            status: "published",
            content: populated,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to publish lecture content",
            error: error.message,
        });
    }
};

/**
 * POST /api/admin/content/:lectureId/unpublish
 * Unpublish content (reverts to draft and removes from student view)
 */
const unpublishAdminContent = async (req, res) => {
    try {
        const { lectureId } = req.params;
        const userId = req.user?.id || req.user?._id;

        const lecture = await Lecture.findById(lectureId);
        if (!lecture) {
            return res.status(404).json({ success: false, message: "Lecture not found" });
        }

        const content = await LectureContent.findOne({ lectureId: lecture._id });
        if (!content) {
            return res.status(404).json({
                success: false,
                message: "No content document found for this lecture",
            });
        }

        content.status = "draft";
        content.publishedData = null; // Clear live student snapshot
        content.reviewedBy = userId;
        await content.save();

        const populated = await LectureContent.findById(content._id)
            .populate("reviewedBy publishedBy", "name email");

        return res.status(200).json({
            success: true,
            message: `Lecture #${lecture.lectureNumber} content unpublished successfully. Content is now draft and hidden from students.`,
            status: "draft",
            content: populated,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to unpublish content",
            error: error.message,
        });
    }
};

/**
 * POST /api/admin/content/bulk-publish
 * Batch publish selected lectures with strict per-lecture validation
 */
const bulkPublishAdminContent = async (req, res) => {
    try {
        const { lectureIds } = req.body;
        const userId = req.user?.id || req.user?._id;

        if (!Array.isArray(lectureIds) || lectureIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Please provide a list of lecture IDs to publish.",
            });
        }

        const contents = await LectureContent.find({
            lectureId: { $in: lectureIds },
        });

        const contentMap = new Map();
        contents.forEach((c) => contentMap.set(String(c.lectureId), c));

        const invalidItems = [];
        const validDocsToPublish = [];

        for (const id of lectureIds) {
            const doc = contentMap.get(String(id));
            if (!doc) {
                invalidItems.push({ lectureId: id, errors: ["No content found for lecture."] });
                continue;
            }

            const val = validateContentForPublishing(doc);
            if (!val.isValid) {
                invalidItems.push({
                    lectureId: id,
                    lectureNumber: doc.lectureNumber,
                    errors: val.errors,
                });
            } else {
                validDocsToPublish.push(doc);
            }
        }

        if (invalidItems.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Bulk publish aborted: ${invalidItems.length} lectures failed validation.`,
                invalidLectures: invalidItems,
            });
        }

        // Publish all valid documents
        const now = new Date();
        for (const doc of validDocsToPublish) {
            doc.status = "published";
            doc.publishedBy = userId;
            doc.reviewedBy = userId;
            doc.publishedAt = now;
            doc.publishedData = {
                notes: doc.notes,
                structuredNotes: doc.structuredNotes,
                tasks: doc.tasks,
                mcqs: doc.mcqs,
                importantPoints: doc.importantPoints,
                keyTakeaways: doc.keyTakeaways,
                usefulResources: doc.usefulResources,
                publishedAt: now,
                publishedBy: userId,
            };
            await doc.save();
        }

        return res.status(200).json({
            success: true,
            message: `Successfully published ${validDocsToPublish.length} lectures to live students.`,
            publishedCount: validDocsToPublish.length,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to perform bulk publish",
            error: error.message,
        });
    }
};

/**
 * DELETE /api/admin/content/:lectureId/tasks/:taskId
 * Delete a specific task from draft
 */
const deleteAdminTask = async (req, res) => {
    try {
        const { lectureId, taskId } = req.params;
        const userId = req.user?.id || req.user?._id;

        const content = await LectureContent.findOne({ lectureId });
        if (!content) {
            return res.status(404).json({ success: false, message: "Content not found" });
        }

        content.tasks = (content.tasks || []).filter(
            (t) => String(t._id) !== String(taskId)
        );
        content.status = "draft";
        content.reviewedBy = userId;
        await content.save();

        return res.status(200).json({
            success: true,
            message: "Task removed from draft",
            tasks: content.tasks,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to delete task",
            error: error.message,
        });
    }
};

/**
 * DELETE /api/admin/content/:lectureId/mcqs/:mcqId
 * Delete a specific MCQ from draft
 */
const deleteAdminMCQ = async (req, res) => {
    try {
        const { lectureId, mcqId } = req.params;
        const userId = req.user?.id || req.user?._id;

        const content = await LectureContent.findOne({ lectureId });
        if (!content) {
            return res.status(404).json({ success: false, message: "Content not found" });
        }

        content.mcqs = (content.mcqs || []).filter(
            (q) => String(q._id) !== String(mcqId)
        );
        content.status = "draft";
        content.reviewedBy = userId;
        await content.save();

        return res.status(200).json({
            success: true,
            message: "MCQ removed from draft",
            mcqs: content.mcqs,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to delete MCQ",
            error: error.message,
        });
    }
};

module.exports = {
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
    validateNotes,
    validateTasks,
    validateMCQs,
    validateContentForPublishing,
};
