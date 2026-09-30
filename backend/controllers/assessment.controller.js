const mongoose = require("mongoose");
const Course = require("../models/course.model");
const Lecture = require("../models/lecture.model");
const Progress = require("../models/progress.model");
const Enrollment = require("../models/enrollment.model");
const Assessment = require("../models/assessment.model");
const AssessmentAttempt = require("../models/assessmentAttempt.model");
const { resolveCourse } = require("../services/courseHelper");
const { issueCertificateForStudent } = require("../services/certificate.service");

/**
 * Validate assessment questions structure
 */
function validateAssessmentQuestions(questions) {
    const errors = [];
    if (!Array.isArray(questions) || questions.length === 0) {
        return { isValid: false, errors: ["Assessment must contain at least one question."] };
    }

    questions.forEach((q, idx) => {
        const num = idx + 1;
        if (!q.question || !q.question.trim()) {
            errors.push(`Question #${num} text cannot be empty.`);
        }

        if (!Array.isArray(q.options) || q.options.length < 2) {
            errors.push(`Question #${num} must contain at least 2 options.`);
        } else {
            const hasEmptyOpt = q.options.some((opt) => !opt || !String(opt).trim());
            if (hasEmptyOpt) {
                errors.push(`Question #${num} contains blank option fields.`);
            }

            const correctIdx = Number(q.correctAnswer);
            if (isNaN(correctIdx) || correctIdx < 0 || correctIdx >= q.options.length) {
                errors.push(`Question #${num} has an invalid correct answer index (${q.correctAnswer}).`);
            }
        }

        if (q.difficulty && !["Easy", "Medium", "Hard"].includes(q.difficulty)) {
            errors.push(`Question #${num} has invalid difficulty '${q.difficulty}'.`);
        }
    });

    return {
        isValid: errors.length === 0,
        errors,
    };
}

/**
 * Sanitize assessment questions for student view (strip correct answers & explanations)
 */
function sanitizeQuestionsForStudent(questions) {
    if (!Array.isArray(questions)) return [];
    return questions.map((q) => ({
        _id: q._id,
        question: q.question,
        options: q.options,
        difficulty: q.difficulty,
        codeSnippet: q.codeSnippet || "",
    }));
}

/**
 * Helper: Check lecture completion prerequisites for a student in a course
 */
async function checkCoursePrerequisites(userId, courseId) {
    const totalLectures = await Lecture.countDocuments({ courseId });
    if (totalLectures === 0) {
        return { isMet: true, completedCount: 0, totalCount: 0, progressPercent: 100 };
    }

    if (!userId) {
        return { isMet: false, completedCount: 0, totalCount: totalLectures, progressPercent: 0 };
    }

    const completedProgressDocs = await Progress.find({
        userId,
        courseId,
        completed: true,
    });

    const completedCount = completedProgressDocs.length;
    const progressPercent = Math.min(100, Math.round((completedCount / totalLectures) * 100));
    const isMet = completedCount >= totalLectures;

    return {
        isMet,
        completedCount,
        totalCount: totalLectures,
        progressPercent,
    };
}

/**
 * GET /api/assessments/course/:courseId
 * Student endpoint to fetch published course assessment info, prerequisite check, & attempts
 */
const getCourseAssessmentStudent = async (req, res) => {
    try {
        const { courseId } = req.params;
        const course = await resolveCourse(courseId);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found",
            });
        }

        const userId = req.user?.id || req.user?._id || null;

        // Check prerequisites
        const prereq = await checkCoursePrerequisites(userId, course._id);

        // Find published assessment
        const assessment = await Assessment.findOne({
            courseId: course._id,
            status: "published",
        });

        if (!assessment) {
            return res.status(200).json({
                success: true,
                hasAssessment: false,
                message: "Final assessment is not available yet.",
                prerequisite: prereq,
            });
        }

        // Fetch user previous attempts if logged in
        let attempts = [];
        let hasPassed = false;
        let bestScore = 0;

        if (userId) {
            attempts = await AssessmentAttempt.find({
                userId,
                assessmentId: assessment._id,
            }).sort({ createdAt: -1 });

            hasPassed = attempts.some((a) => a.passed);
            bestScore = attempts.reduce((max, a) => Math.max(max, a.percentage || 0), 0);
        }

        // Return sanitized questions (no correct answers exposed!)
        return res.status(200).json({
            success: true,
            hasAssessment: true,
            assessment: {
                _id: assessment._id,
                title: assessment.title,
                description: assessment.description,
                passingPercentage: assessment.passingPercentage,
                timeLimitMinutes: assessment.timeLimitMinutes,
                maxAttempts: assessment.maxAttempts,
                totalQuestions: assessment.questions.length,
                questions: sanitizeQuestionsForStudent(assessment.questions),
            },
            course: {
                _id: course._id,
                title: course.title,
            },
            prerequisite: prereq,
            attempts: attempts.map((a) => ({
                _id: a._id,
                attemptNumber: a.attemptNumber,
                score: a.score,
                totalQuestions: a.totalQuestions,
                percentage: a.percentage,
                passingPercentage: a.passingPercentage,
                passed: a.passed,
                startedAt: a.startedAt,
                submittedAt: a.submittedAt,
                timeSpentSeconds: a.timeSpentSeconds,
            })),
            hasPassed,
            bestScore,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to load course assessment",
            error: error.message,
        });
    }
};

/**
 * GET /api/assessments/:assessmentId
 * Student endpoint to fetch a specific published assessment (sanitized)
 */
const getAssessmentByIdStudent = async (req, res) => {
    try {
        const { assessmentId } = req.params;
        const assessment = await Assessment.findOne({
            _id: assessmentId,
            status: "published",
        }).populate("courseId", "title category level");

        if (!assessment) {
            return res.status(404).json({
                success: false,
                message: "Published assessment not found",
            });
        }

        const userId = req.user?.id || req.user?._id || null;
        const prereq = await checkCoursePrerequisites(userId, assessment.courseId._id);

        return res.status(200).json({
            success: true,
            assessment: {
                _id: assessment._id,
                title: assessment.title,
                description: assessment.description,
                passingPercentage: assessment.passingPercentage,
                timeLimitMinutes: assessment.timeLimitMinutes,
                totalQuestions: assessment.questions.length,
                questions: sanitizeQuestionsForStudent(assessment.questions),
                course: assessment.courseId,
            },
            prerequisite: prereq,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to load assessment",
            error: error.message,
        });
    }
};

/**
 * POST /api/assessments/:assessmentId/start
 * Start a new assessment session after verifying prerequisites
 */
const startAssessmentAttempt = async (req, res) => {
    try {
        const { assessmentId } = req.params;
        const userId = req.user?.id || req.user?._id;

        if (!userId) {
            return res.status(401).json({ success: false, message: "Authentication required to take assessment." });
        }

        const assessment = await Assessment.findOne({
            _id: assessmentId,
            status: "published",
        });

        if (!assessment) {
            return res.status(404).json({ success: false, message: "Published assessment not found." });
        }

        // Check prerequisites
        const prereq = await checkCoursePrerequisites(userId, assessment.courseId);
        if (!prereq.isMet) {
            return res.status(403).json({
                success: false,
                message: `Complete all required lectures before taking the final assessment. (Completed: ${prereq.completedCount}/${prereq.totalCount} lectures)`,
                prerequisite: prereq,
            });
        }

        return res.status(200).json({
            success: true,
            message: "Assessment started successfully",
            assessmentId: assessment._id,
            title: assessment.title,
            passingPercentage: assessment.passingPercentage,
            timeLimitMinutes: assessment.timeLimitMinutes,
            totalQuestions: assessment.questions.length,
            questions: sanitizeQuestionsForStudent(assessment.questions),
            startedAt: new Date(),
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to start assessment",
            error: error.message,
        });
    }
};

/**
 * POST /api/assessments/:assessmentId/submit
 * Submit answers, grade on backend, record attempt, and update course completion if passed
 */
const submitAssessmentAttempt = async (req, res) => {
    try {
        const { assessmentId } = req.params;
        const { answers = [], startedAt, timeSpentSeconds = 0 } = req.body;
        const userId = req.user?.id || req.user?._id;

        if (!userId) {
            return res.status(401).json({ success: false, message: "Authentication required to submit assessment." });
        }

        const assessment = await Assessment.findOne({
            _id: assessmentId,
            status: "published",
        });

        if (!assessment) {
            return res.status(404).json({ success: false, message: "Published assessment not found." });
        }

        // Check prerequisites
        const prereq = await checkCoursePrerequisites(userId, assessment.courseId);
        if (!prereq.isMet) {
            return res.status(403).json({
                success: false,
                message: "Complete all required lectures before submitting the final assessment.",
                prerequisite: prereq,
            });
        }

        // Map student answers by question ID
        const studentAnswerMap = new Map();
        if (Array.isArray(answers)) {
            answers.forEach((ans) => {
                if (ans && ans.questionId !== undefined) {
                    studentAnswerMap.set(String(ans.questionId), ans.selectedOption);
                }
            });
        }

        // Grade answers securely on backend
        let correctCount = 0;
        const gradedAnswers = [];
        const detailedReview = [];

        assessment.questions.forEach((q) => {
            const studentSelected = studentAnswerMap.get(String(q._id));
            const hasSelected = studentSelected !== undefined && studentSelected !== null;
            const isCorrect = hasSelected && Number(studentSelected) === q.correctAnswer;

            if (isCorrect) correctCount++;

            gradedAnswers.push({
                questionId: q._id,
                selectedOption: hasSelected ? Number(studentSelected) : null,
                isCorrect,
                correctAnswer: q.correctAnswer,
                explanation: q.explanation || "",
            });

            detailedReview.push({
                questionId: q._id,
                question: q.question,
                options: q.options,
                selectedOption: hasSelected ? Number(studentSelected) : null,
                correctAnswer: q.correctAnswer,
                isCorrect,
                explanation: q.explanation || "",
                difficulty: q.difficulty,
                codeSnippet: q.codeSnippet || "",
            });
        });

        const totalQuestions = assessment.questions.length;
        const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
        const passed = percentage >= assessment.passingPercentage;

        // Calculate attempt number
        const previousAttemptsCount = await AssessmentAttempt.countDocuments({
            userId,
            assessmentId: assessment._id,
        });
        const attemptNumber = previousAttemptsCount + 1;

        // Save Attempt Record
        const attemptDoc = await AssessmentAttempt.create({
            userId,
            courseId: assessment.courseId,
            assessmentId: assessment._id,
            attemptNumber,
            answers: gradedAnswers,
            totalQuestions,
            correctAnswers: correctCount,
            score: correctCount,
            percentage,
            passingPercentage: assessment.passingPercentage,
            passed,
            status: "submitted",
            startedAt: startedAt ? new Date(startedAt) : new Date(Date.now() - (timeSpentSeconds * 1000)),
            submittedAt: new Date(),
            timeSpentSeconds,
        });

        // Update Course Completion in Enrollment if passed & all lectures complete
        let courseCompleted = false;
        let certificateData = null;

        if (passed && prereq.isMet) {
            courseCompleted = true;
            await Enrollment.findOneAndUpdate(
                { user: userId, course: assessment.courseId },
                {
                    $set: {
                        courseCompleted: true,
                        completedAt: new Date(),
                        assessmentPassed: true,
                        progress: 100,
                    },
                    $max: {
                        bestAssessmentScore: percentage,
                    },
                },
                { upsert: true, returnDocument: 'after' }
            );

            // Automatically issue verified certificate upon passing + completing all lectures
            try {
                const certResult = await issueCertificateForStudent(userId, assessment.courseId);
                if (certResult?.certificate) {
                    certificateData = {
                        certificateId: certResult.certificate.certificateId,
                        viewUrl: `/certificate/${certResult.certificate.certificateId}`,
                        downloadUrl: `/api/certificates/${certResult.certificate.certificateId}/download`,
                    };
                }
            } catch (certErr) {
                console.warn("Certificate auto-issuance note:", certErr.message);
            }
        } else if (passed) {
            await Enrollment.findOneAndUpdate(
                { user: userId, course: assessment.courseId },
                {
                    $set: { assessmentPassed: true },
                    $max: { bestAssessmentScore: percentage },
                },
                { upsert: true }
            );
        }

        return res.status(200).json({
            success: true,
            message: passed ? "🎉 Congratulations! You passed the final assessment." : "Assessment submitted. Score did not meet the passing threshold.",
            attempt: {
                _id: attemptDoc._id,
                attemptNumber,
                totalQuestions,
                correctAnswers: correctCount,
                score: correctCount,
                percentage,
                passingPercentage: assessment.passingPercentage,
                passed,
                courseCompleted,
                certificate: certificateData,
                submittedAt: attemptDoc.submittedAt,
                timeSpentSeconds,
                answersReview: detailedReview,
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to submit assessment",
            error: error.message,
        });
    }
};

/**
 * GET /api/assessments/:assessmentId/my-attempts
 * Fetch all previous assessment attempts for the authenticated student
 */
const getMyAttempts = async (req, res) => {
    try {
        const { assessmentId } = req.params;
        const userId = req.user?.id || req.user?._id;

        if (!userId) {
            return res.status(401).json({ success: false, message: "Authentication required" });
        }

        const attempts = await AssessmentAttempt.find({
            userId,
            assessmentId,
        }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            attempts,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to load assessment attempts",
            error: error.message,
        });
    }
};

/**
 * GET /api/courses/:courseId/completion
 * Get complete course status including lectures progress and assessment passing
 */
const getCourseCompletionStatus = async (req, res) => {
    try {
        const { courseId } = req.params;
        const course = await resolveCourse(courseId);

        if (!course) {
            return res.status(404).json({ success: false, message: "Course not found" });
        }

        const userId = req.user?.id || req.user?._id || null;
        const prereq = await checkCoursePrerequisites(userId, course._id);

        let assessmentPassed = false;
        let bestScore = 0;
        let courseCompleted = false;
        let completedAt = null;

        if (userId) {
            const enrollment = await Enrollment.findOne({ user: userId, course: course._id });
            if (enrollment) {
                courseCompleted = Boolean(enrollment.courseCompleted);
                completedAt = enrollment.completedAt || null;
                assessmentPassed = Boolean(enrollment.assessmentPassed);
                bestScore = enrollment.bestAssessmentScore || 0;
            }

            const passedAttempt = await AssessmentAttempt.findOne({
                userId,
                courseId: course._id,
                passed: true,
            });

            if (passedAttempt) {
                assessmentPassed = true;
                bestScore = Math.max(bestScore, passedAttempt.percentage);
                if (prereq.isMet && !courseCompleted) {
                    courseCompleted = true;
                    completedAt = passedAttempt.submittedAt;
                }
            }
        }

        return res.status(200).json({
            success: true,
            course: {
                _id: course._id,
                title: course.title,
            },
            lecturesCompleted: prereq.completedCount,
            totalLectures: prereq.totalCount,
            lectureProgressPercent: prereq.progressPercent,
            isPrerequisiteMet: prereq.isMet,
            assessmentPassed,
            bestScore,
            courseCompleted,
            completedAt,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to check course completion status",
            error: error.message,
        });
    }
};

// ==========================================
// ADMIN ASSESSMENT CONTROLLERS
// ==========================================

/**
 * GET /api/admin/assessments
 * List all assessments with course details and attempt statistics
 */
const getAdminAssessments = async (req, res) => {
    try {
        const { courseId } = req.query;
        const query = {};
        if (courseId) query.courseId = courseId;

        const assessments = await Assessment.find(query)
            .populate("courseId", "title category level")
            .populate("createdBy publishedBy", "name email")
            .sort({ updatedAt: -1 });

        return res.status(200).json({
            success: true,
            assessments,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch assessments list",
            error: error.message,
        });
    }
};

/**
 * GET /api/admin/assessments/:assessmentId
 * Get full assessment including all questions & correct answers for admin editing
 */
const getAdminAssessmentById = async (req, res) => {
    try {
        const { assessmentId } = req.params;
        const assessment = await Assessment.findById(assessmentId)
            .populate("courseId", "title category level duration")
            .populate("createdBy publishedBy", "name email");

        if (!assessment) {
            return res.status(404).json({ success: false, message: "Assessment not found" });
        }

        const totalAttempts = await AssessmentAttempt.countDocuments({ assessmentId: assessment._id });
        const passedAttempts = await AssessmentAttempt.countDocuments({ assessmentId: assessment._id, passed: true });

        return res.status(200).json({
            success: true,
            assessment,
            stats: {
                totalAttempts,
                passedAttempts,
                passRate: totalAttempts > 0 ? Math.round((passedAttempts / totalAttempts) * 100) : 0,
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch assessment details",
            error: error.message,
        });
    }
};

/**
 * POST /api/admin/assessments
 * Create a new assessment draft
 */
const createAdminAssessment = async (req, res) => {
    try {
        const { courseId, title, description, passingPercentage = 70, timeLimitMinutes = 30, questions = [] } = req.body;
        const userId = req.user?.id || req.user?._id;

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ success: false, message: "Course not found" });
        }

        const assessment = await Assessment.create({
            courseId: course._id,
            title: title || `${course.title} Final Assessment`,
            description: description || `Comprehensive assessment evaluating your knowledge of ${course.title}.`,
            passingPercentage: Number(passingPercentage) || 70,
            timeLimitMinutes: Number(timeLimitMinutes) || 30,
            questions: questions || [],
            status: "draft",
            createdBy: userId,
        });

        return res.status(201).json({
            success: true,
            message: "Assessment draft created successfully",
            assessment,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to create assessment",
            error: error.message,
        });
    }
};

/**
 * PUT /api/admin/assessments/:assessmentId
 * Update assessment settings and questions in draft mode
 */
const updateAdminAssessment = async (req, res) => {
    try {
        const { assessmentId } = req.params;
        const { title, description, passingPercentage, timeLimitMinutes, questions } = req.body;

        const updateData = { status: "draft" }; // Updates keep assessment in draft until re-published
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (passingPercentage !== undefined) updateData.passingPercentage = Number(passingPercentage);
        if (timeLimitMinutes !== undefined) updateData.timeLimitMinutes = Number(timeLimitMinutes);
        if (questions !== undefined) updateData.questions = questions;

        const assessment = await Assessment.findByIdAndUpdate(
            assessmentId,
            { $set: updateData },
            { new: true, runValidators: true }
        ).populate("courseId", "title");

        if (!assessment) {
            return res.status(404).json({ success: false, message: "Assessment not found" });
        }

        return res.status(200).json({
            success: true,
            message: "Assessment saved as draft successfully",
            assessment,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to update assessment",
            error: error.message,
        });
    }
};

/**
 * POST /api/admin/assessments/:assessmentId/publish
 * Validate and publish assessment
 */
const publishAdminAssessment = async (req, res) => {
    try {
        const { assessmentId } = req.params;
        const userId = req.user?.id || req.user?._id;

        const assessment = await Assessment.findById(assessmentId);
        if (!assessment) {
            return res.status(404).json({ success: false, message: "Assessment not found" });
        }

        const validation = validateAssessmentQuestions(assessment.questions);
        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                message: "Assessment failed validation and cannot be published.",
                errors: validation.errors,
            });
        }

        assessment.status = "published";
        assessment.publishedBy = userId;
        assessment.publishedAt = new Date();
        await assessment.save();

        return res.status(200).json({
            success: true,
            message: `Assessment "${assessment.title}" published successfully to students!`,
            assessment,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to publish assessment",
            error: error.message,
        });
    }
};

/**
 * POST /api/admin/assessments/:assessmentId/unpublish
 * Revert assessment to draft
 */
const unpublishAdminAssessment = async (req, res) => {
    try {
        const { assessmentId } = req.params;

        const assessment = await Assessment.findByIdAndUpdate(
            assessmentId,
            { $set: { status: "draft" } },
            { new: true }
        );

        if (!assessment) {
            return res.status(404).json({ success: false, message: "Assessment not found" });
        }

        return res.status(200).json({
            success: true,
            message: `Assessment reverted to draft and hidden from students.`,
            assessment,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to unpublish assessment",
            error: error.message,
        });
    }
};

/**
 * DELETE /api/admin/assessments/:assessmentId
 * Delete an assessment
 */
const deleteAdminAssessment = async (req, res) => {
    try {
        const { assessmentId } = req.params;
        const deleted = await Assessment.findByIdAndDelete(assessmentId);

        if (!deleted) {
            return res.status(404).json({ success: false, message: "Assessment not found" });
        }

        return res.status(200).json({
            success: true,
            message: "Assessment deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to delete assessment",
            error: error.message,
        });
    }
};

module.exports = {
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
    validateAssessmentQuestions,
};
