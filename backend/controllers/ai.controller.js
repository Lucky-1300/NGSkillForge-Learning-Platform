const {
    isConfigured,
    getActiveModel,
    generateChatCompletion,
} = require("../services/ai.service");

const {
    resolveLectureContext,
    generateAINotes,
    generateAITasks,
    generateAIMCQs,
} = require("../services/aiContent.service");

const { askAITutor } = require("../services/aiTutor.service");
const { getLectureTranscript } = require("../services/transcript.service");
const { resolveCourse, groupLecturesIntoModules } = require("../services/courseHelper");
const LectureContent = require("../models/lectureContent.model");
const Lecture = require("../models/lecture.model");
const Course = require("../models/course.model");

/**
 * Generate Structured Educational Notes for a specific Lecture
 * POST /api/ai/generate-notes
 *
 * Request:
 * {
 *   "lectureId": "6abb7849db9a4a6f25f3636e"
 * }
 */
const generateNotes = async (req, res) => {
    try {
        const { lectureId } = req.body;

        if (!lectureId) {
            return res.status(400).json({
                success: false,
                message: "Validation Error: 'lectureId' is required in request body.",
            });
        }

        // 1. Resolve and validate lecture context (includes transcript resolution)
        const { lecture, course, context } = await resolveLectureContext(lectureId);

        // 2. Check AI service configuration
        if (!isConfigured()) {
            return res.status(503).json({
                success: false,
                message: "Groq AI service is not configured. Please set a valid GROQ_API_KEY in the backend .env file.",
            });
        }

        // 3. Generate structured notes with Groq
        const result = await generateAINotes(context);

        return res.status(200).json({
            success: true,
            status: "draft",
            message: "Notes generated successfully and saved as draft.",
            lectureId: lecture._id,
            lectureNumber: lecture.lectureNumber,
            courseId: course._id,
            courseTitle: course.title,
            sourceContext: result.sourceContext,
            notes: result.structuredNotes,
            markdown: result.markdownNotes,
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({
            success: false,
            message: error.message || "Failed to generate notes.",
        });
    }
};

/**
 * Generate Practical Hands-on Tasks for a specific Lecture
 * POST /api/ai/generate-tasks
 *
 * Request:
 * {
 *   "lectureId": "6abb7849db9a4a6f25f3636e",
 *   "count": 3
 * }
 */
const generateTasks = async (req, res) => {
    try {
        const { lectureId, count } = req.body;

        if (!lectureId) {
            return res.status(400).json({
                success: false,
                message: "Validation Error: 'lectureId' is required in request body.",
            });
        }

        // 1. Resolve and validate lecture context
        const { lecture, course, context } = await resolveLectureContext(lectureId);

        // 2. Check AI service configuration
        if (!isConfigured()) {
            return res.status(503).json({
                success: false,
                message: "Groq AI service is not configured. Please set a valid GROQ_API_KEY in the backend .env file.",
            });
        }

        // 3. Generate tasks with Groq
        const result = await generateAITasks(context, { count });

        return res.status(200).json({
            success: true,
            status: "draft",
            message: "Practice tasks generated successfully and saved as draft.",
            lectureId: lecture._id,
            lectureNumber: lecture.lectureNumber,
            courseId: course._id,
            courseTitle: course.title,
            sourceContext: result.sourceContext,
            tasksCount: result.tasks.length,
            tasks: result.tasks,
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({
            success: false,
            message: error.message || "Failed to generate tasks.",
        });
    }
};

/**
 * Generate Multiple-Choice Quiz Questions (MCQs) for a specific Lecture
 * POST /api/ai/generate-mcqs
 *
 * Request:
 * {
 *   "lectureId": "6abb7849db9a4a6f25f3636e",
 *   "count": 5
 * }
 */
const generateMCQs = async (req, res) => {
    try {
        const { lectureId, count } = req.body;

        if (!lectureId) {
            return res.status(400).json({
                success: false,
                message: "Validation Error: 'lectureId' is required in request body.",
            });
        }

        // 1. Resolve and validate lecture context
        const { lecture, course, context } = await resolveLectureContext(lectureId);

        // 2. Check AI service configuration
        if (!isConfigured()) {
            return res.status(503).json({
                success: false,
                message: "Groq AI service is not configured. Please set a valid GROQ_API_KEY in the backend .env file.",
            });
        }

        // 3. Generate MCQs with Groq
        const result = await generateAIMCQs(context, { count });

        return res.status(200).json({
            success: true,
            status: "draft",
            message: "MCQ quiz questions generated successfully and saved as draft.",
            lectureId: lecture._id,
            lectureNumber: lecture.lectureNumber,
            courseId: course._id,
            courseTitle: course.title,
            sourceContext: result.sourceContext,
            mcqsCount: result.mcqs.length,
            mcqs: result.mcqs,
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({
            success: false,
            message: error.message || "Failed to generate MCQs.",
        });
    }
};

/**
 * Fetch Transcript for a specific Lecture
 * GET /api/ai/transcript/:lectureId
 */
const getLectureTranscriptHandler = async (req, res) => {
    try {
        const { lectureId } = req.params;
        const result = await getLectureTranscript(lectureId, { forceRefresh: false });

        if (!result.success) {
            return res.status(200).json({
                success: false,
                reason: result.reason || "TRANSCRIPT_UNAVAILABLE",
                message: result.message || "Captions/transcript unavailable for this lecture.",
                lectureId: result.lectureId,
                videoId: result.videoId,
            });
        }

        return res.status(200).json({
            success: true,
            lectureId: result.lectureId,
            videoId: result.videoId,
            language: result.language,
            source: result.source,
            characterCount: result.characterCount,
            segmentCount: result.segmentCount,
            transcriptText: result.transcriptText,
            cached: result.cached,
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({
            success: false,
            message: error.message || "Failed to retrieve lecture transcript.",
        });
    }
};

/**
 * Force Refresh Transcript extraction from YouTube
 * POST /api/ai/fetch-transcript/:lectureId
 */
const refreshLectureTranscriptHandler = async (req, res) => {
    try {
        const { lectureId } = req.params;
        const result = await getLectureTranscript(lectureId, { forceRefresh: true });

        return res.status(200).json(result);
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({
            success: false,
            message: error.message || "Failed to refresh transcript.",
        });
    }
};

/**
 * Fetch Draft or Published Content for a specific Lecture
 * GET /api/ai/content/:lectureId
 */
const getLectureContentDraft = async (req, res) => {
    try {
        const { lectureId } = req.params;
        const { lecture } = await resolveLectureContext(lectureId);

        const content = await LectureContent.findOne({
            courseId: lecture.courseId,
            lectureNumber: lecture.lectureNumber,
        });

        if (!content) {
            return res.status(404).json({
                success: false,
                message: "No draft or generated content found for this lecture.",
            });
        }

        return res.status(200).json({
            success: true,
            status: content.status,
            lectureId: lecture._id,
            lectureNumber: lecture.lectureNumber,
            content,
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({
            success: false,
            message: error.message || "Failed to retrieve lecture content draft.",
        });
    }
};

/**
 * Publish AI-generated Content after Admin Review
 * POST /api/ai/publish-content/:lectureId
 */
const publishLectureContent = async (req, res) => {
    try {
        const { lectureId } = req.params;
        const { lecture } = await resolveLectureContext(lectureId);

        const content = await LectureContent.findOneAndUpdate(
            {
                courseId: lecture.courseId,
                lectureNumber: lecture.lectureNumber,
            },
            {
                $set: {
                    status: "published",
                    reviewedBy: req.user?._id || null,
                },
            },
            { new: true }
        );

        if (!content) {
            return res.status(404).json({
                success: false,
                message: "No content found to publish for this lecture.",
            });
        }

        return res.status(200).json({
            success: true,
            status: "published",
            message: "Lecture content has been reviewed and published successfully.",
            content,
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({
            success: false,
            message: error.message || "Failed to publish lecture content.",
        });
    }
};

/**
 * Test Groq AI connectivity and prompt response
 * POST /api/ai/test
 */
const testAI = async (req, res) => {
    try {
        const { message, systemPrompt, model } = req.body;

        if (message === undefined || message === null) {
            return res.status(400).json({
                success: false,
                message: "Validation Error: 'message' field is required in request body.",
            });
        }

        if (typeof message !== "string") {
            return res.status(400).json({
                success: false,
                message: "Validation Error: 'message' must be a valid string.",
            });
        }

        const trimmedMessage = message.trim();
        if (trimmedMessage.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Validation Error: 'message' cannot be empty or whitespace only.",
            });
        }

        if (!isConfigured()) {
            return res.status(503).json({
                success: false,
                message: "Groq AI service is not configured. Please set a valid GROQ_API_KEY in the backend .env file.",
            });
        }

        const aiResult = await generateChatCompletion({
            prompt: trimmedMessage,
            systemPrompt: systemPrompt || undefined,
            model: model || undefined,
            temperature: 0.7,
            maxTokens: 1000,
        });

        return res.status(200).json({
            success: true,
            response: aiResult.text,
            model: aiResult.model,
            usage: aiResult.usage,
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({
            success: false,
            message: error.message || "Failed to process AI request.",
        });
    }
};

/**
 * Student-facing Ask AI Endpoint for a specific Lecture
 * POST /api/ai/ask-lecture
/**
 * Student-facing Lecture-Specific AI Tutor
 * POST /api/ai/lecture/:lectureId/ask
 * POST /api/ai/ask-lecture
 * POST /api/ai/ask
 *
 * Request:
 * {
 *   "lectureId": "6abb7849db9a4a6f25f3636e",
 *   "message": "Explain closures in simple words",
 *   "conversationHistory": [{ "role": "user"|"assistant", "content": "..." }]
 * }
 */
const askLectureAI = async (req, res) => {
    try {
        const lectureId = req.params?.lectureId || req.body?.lectureId;
        const message = req.body?.message || req.body?.question;
        const conversationHistory = req.body?.conversationHistory || req.body?.history || [];

        if (!lectureId) {
            return res.status(400).json({
                success: false,
                message: "Validation Error: 'lectureId' is required in URL parameters or request body.",
            });
        }

        if (!message || typeof message !== "string" || !message.trim()) {
            return res.status(400).json({
                success: false,
                message: "Validation Error: 'message' or 'question' string is required.",
            });
        }

        const result = await askAITutor({
            lectureId,
            message,
            conversationHistory,
            user: req.user || null,
        });

        return res.status(200).json({
            success: true,
            answer: result.answer,
            lectureId: result.lecture._id,
            lectureNumber: result.lecture.lectureNumber,
            lectureTitle: result.lecture.title,
            courseTitle: result.course.title,
            module: result.module,
            metadata: result.metadata,
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({
            success: false,
            message: error.message || "Failed to process AI tutor request.",
            error: error.message,
        });
    }
};

/**
 * Unified generation endpoint for selecting lectures and specific components (Notes, Tasks, MCQs)
 * POST /api/ai/generate-content
 */
const generateSelectedContent = async (req, res) => {
    try {
        const {
            lectureIds,
            generateNotes: shouldGenNotes = true,
            generateTasks: shouldGenTasks = true,
            generateMCQs: shouldGenMCQs = true,
            taskCount = 3,
            mcqCount = 5,
        } = req.body;

        if (!Array.isArray(lectureIds) || lectureIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Validation Error: 'lectureIds' array is required and cannot be empty.",
            });
        }

        if (!shouldGenNotes && !shouldGenTasks && !shouldGenMCQs) {
            return res.status(400).json({
                success: false,
                message: "Please select at least one content type to generate (Notes, Tasks, or MCQs).",
            });
        }

        if (!isConfigured()) {
            return res.status(503).json({
                success: false,
                message: "Groq AI service is not configured. Please set GROQ_API_KEY in backend .env file.",
            });
        }

        const results = [];
        for (const id of lectureIds) {
            try {
                const { lecture, course, context } = await resolveLectureContext(id);
                const generatedItems = [];

                if (shouldGenNotes) {
                    await generateAINotes(context);
                    generatedItems.push("Notes");
                }
                if (shouldGenTasks) {
                    await generateAITasks(context, { count: taskCount });
                    generatedItems.push("Tasks");
                }
                if (shouldGenMCQs) {
                    await generateAIMCQs(context, { count: mcqCount });
                    generatedItems.push("MCQs");
                }

                const updatedDoc = await LectureContent.findOne({
                    courseId: course._id,
                    lectureNumber: lecture.lectureNumber,
                });

                results.push({
                    lectureId: lecture._id,
                    lectureNumber: lecture.lectureNumber,
                    title: lecture.title,
                    success: true,
                    status: updatedDoc?.status || "draft",
                    generatedItems,
                    hasTranscript: context.hasTranscript,
                    transcriptSource: context.transcriptSource,
                });
            } catch (itemErr) {
                results.push({
                    lectureId: id,
                    success: false,
                    error: itemErr.message || "Failed to generate content for this lecture.",
                });
            }
        }

        const successCount = results.filter((r) => r.success).length;

        return res.status(200).json({
            success: true,
            message: `Successfully generated AI content for ${successCount}/${lectureIds.length} lectures.`,
            totalProcessed: lectureIds.length,
            successCount,
            results,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to process content generation request.",
        });
    }
};

/**
 * Get comprehensive content status for a course (lectures, modules, draft/published state)
 * GET /api/ai/course-status/:courseId
 */
const getCourseContentStatus = async (req, res) => {
    try {
        const { courseId } = req.params;
        const course = await resolveCourse(courseId);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found",
            });
        }

        const lectures = await Lecture.find({ courseId: course._id }).sort({ lectureNumber: 1 });
        const contents = await LectureContent.find({ courseId: course._id });
        const modules = groupLecturesIntoModules(lectures, course);

        const contentMap = new Map();
        contents.forEach((c) => {
            contentMap.set(c.lectureNumber, c);
        });

        const lectureStatuses = lectures.map((lec) => {
            const content = contentMap.get(lec.lectureNumber);
            const hasNotes = Boolean(content && (content.notes || content.structuredNotes?.sections?.length > 0));
            const hasTasks = Boolean(content && Array.isArray(content.tasks) && content.tasks.length > 0);
            const hasMCQs = Boolean(content && Array.isArray(content.mcqs) && content.mcqs.length > 0);

            return {
                _id: lec._id,
                lectureNumber: lec.lectureNumber,
                title: lec.title,
                duration: lec.duration,
                youtubeVideoId: lec.youtubeVideoId,
                thumbnailUrl: lec.thumbnailUrl,
                status: content?.status || "none", // "draft" | "published" | "none"
                hasNotes,
                tasksCount: content?.tasks?.length || 0,
                mcqsCount: content?.mcqs?.length || 0,
                generatedBy: content?.generatedBy || null,
                updatedAt: content?.updatedAt || null,
            };
        });

        const draftCount = lectureStatuses.filter((l) => l.status === "draft").length;
        const publishedCount = lectureStatuses.filter((l) => l.status === "published").length;
        const missingCount = lectureStatuses.filter((l) => l.status === "none").length;

        return res.status(200).json({
            success: true,
            course: {
                _id: course._id,
                title: course.title,
                category: course.category,
                level: course.level,
            },
            totalLectures: lectures.length,
            stats: {
                draftCount,
                publishedCount,
                missingCount,
                completeCount: publishedCount + draftCount,
            },
            modules,
            lectures: lectureStatuses,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch course content status",
            error: error.message,
        });
    }
};

/**
 * Publish all draft content for an entire course
 * POST /api/ai/publish-course-content/:courseId
 */
const publishCourseContent = async (req, res) => {
    try {
        const { courseId } = req.params;
        const course = await resolveCourse(courseId);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found",
            });
        }

        const result = await LectureContent.updateMany(
            { courseId: course._id, status: "draft" },
            {
                $set: {
                    status: "published",
                    reviewedBy: req.user?._id || req.user?.id || null,
                },
            }
        );

        return res.status(200).json({
            success: true,
            message: `Successfully published ${result.modifiedCount} draft lectures for "${course.title}".`,
            modifiedCount: result.modifiedCount,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to publish course content",
            error: error.message,
        });
    }
};

/**
 * Update / Edit Lecture Content draft
 * PUT /api/ai/content/:lectureId
 */
const updateLectureContent = async (req, res) => {
    try {
        const { lectureId } = req.params;
        const { lecture } = await resolveLectureContext(lectureId);
        const { notes, structuredNotes, tasks, mcqs, status } = req.body;

        const updateFields = {};
        if (notes !== undefined) updateFields.notes = notes;
        if (structuredNotes !== undefined) updateFields.structuredNotes = structuredNotes;
        if (tasks !== undefined) updateFields.tasks = tasks;
        if (mcqs !== undefined) updateFields.mcqs = mcqs;
        if (status !== undefined) updateFields.status = status;

        const updated = await LectureContent.findOneAndUpdate(
            {
                courseId: lecture.courseId,
                lectureNumber: lecture.lectureNumber,
            },
            { $set: updateFields },
            { upsert: true, returnDocument: "after" }
        );

        return res.status(200).json({
            success: true,
            message: "Lecture content updated successfully.",
            content: updated,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to update lecture content",
            error: error.message,
        });
    }
};

/**
 * Health/Status endpoint for AI service configuration
 * GET /api/ai/status
 */
const getAIStatus = async (req, res) => {
    try {
        const configured = isConfigured();
        const activeModel = getActiveModel();

        return res.status(200).json({
            success: true,
            configured,
            provider: "Groq",
            model: activeModel,
            status: configured ? "ready" : "api_key_required",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve AI service status.",
        });
    }
};

module.exports = {
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
};
