const mongoose = require("mongoose");
const Progress = require("../models/progress.model");
const Lecture = require("../models/lecture.model");
const Course = require("../models/course.model");
const Enrollment = require("../models/enrollment.model");
const { resolveCourse, groupLecturesIntoModules } = require("../services/courseHelper");

/**
 * Helper to resolve lecture by ObjectId or identifier
 */
async function resolveLecture(lectureId, courseId = null) {
    if (!lectureId) return null;
    if (mongoose.Types.ObjectId.isValid(lectureId)) {
        const byId = await Lecture.findById(lectureId);
        if (byId) return byId;
    }
    // If lectureNumber is provided along with courseId
    if (courseId) {
        const num = parseInt(lectureId, 10);
        if (!isNaN(num)) {
            return await Lecture.findOne({ courseId, lectureNumber: num });
        }
    }
    return null;
}

/**
 * Mark a lecture as complete (or uncomplete if specified)
 * POST /api/progress/lecture/:lectureId/complete
 */
const markLectureComplete = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        const { lectureId } = req.params;
        const lecture = await resolveLecture(lectureId);

        if (!lecture) {
            return res.status(404).json({
                success: false,
                message: "Lecture not found",
            });
        }

        const courseId = lecture.courseId;
        const shouldComplete = req.body.completed !== undefined ? Boolean(req.body.completed) : true;
        const now = new Date();

        const progress = await Progress.findOneAndUpdate(
            { userId, lectureId: lecture._id },
            {
                $set: {
                    userId,
                    courseId,
                    lectureId: lecture._id,
                    completed: shouldComplete,
                    completedAt: shouldComplete ? now : null,
                    lastAccessedAt: now,
                },
            },
            { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
        );

        // Fetch course lectures to compute accurate updated progress
        const allLectures = await Lecture.find({ courseId }).sort({ lectureNumber: 1 });
        const totalLectures = allLectures.length;

        // Fetch all completed progress for this user in this course
        const allProgress = await Progress.find({ userId, courseId, completed: true });
        const completedCount = allProgress.length;
        const progressPercentage = totalLectures > 0 ? Math.min(100, Math.round((completedCount / totalLectures) * 100)) : 0;

        // Sync with Enrollment model if exists or create to maintain consistency across dashboards
        const lectureKey = `lecture-${lecture.lectureNumber}`;
        const enrollment = await Enrollment.findOne({ user: userId, course: courseId });
        if (enrollment) {
            let completedLessons = enrollment.completedLessons || [];
            if (shouldComplete && !completedLessons.includes(lectureKey)) {
                completedLessons.push(lectureKey);
            } else if (!shouldComplete && completedLessons.includes(lectureKey)) {
                completedLessons = completedLessons.filter((k) => k !== lectureKey && k !== String(lecture.lectureNumber));
            }
            enrollment.completedLessons = completedLessons;
            enrollment.progress = progressPercentage;
            await enrollment.save();
        } else if (shouldComplete) {
            await Enrollment.create({
                user: userId,
                course: courseId,
                completedLessons: [lectureKey],
                progress: progressPercentage,
            });
        }

        return res.status(200).json({
            success: true,
            message: shouldComplete ? "Lecture marked as completed" : "Lecture marked as incomplete",
            isCompleted: shouldComplete,
            progress: {
                lectureId: lecture._id,
                lectureNumber: lecture.lectureNumber,
                completed: progress.completed,
                completedAt: progress.completedAt,
                lastAccessedAt: progress.lastAccessedAt,
            },
            courseProgress: {
                courseId,
                totalLectures,
                completedCount,
                progressPercentage,
                isCourseCompleted: totalLectures > 0 && completedCount === totalLectures,
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to update lecture progress",
            error: error.message,
        });
    }
};

/**
 * Toggle lecture completion status
 * POST /api/progress/lecture/:lectureId/toggle
 */
const toggleLectureComplete = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        const { lectureId } = req.params;
        const lecture = await resolveLecture(lectureId);

        if (!lecture) {
            return res.status(404).json({
                success: false,
                message: "Lecture not found",
            });
        }

        const courseId = lecture.courseId;
        const existingProgress = await Progress.findOne({ userId, lectureId: lecture._id });
        const shouldComplete = !existingProgress || !existingProgress.completed;
        const now = new Date();

        const progress = await Progress.findOneAndUpdate(
            { userId, lectureId: lecture._id },
            {
                $set: {
                    userId,
                    courseId,
                    lectureId: lecture._id,
                    completed: shouldComplete,
                    completedAt: shouldComplete ? now : null,
                    lastAccessedAt: now,
                },
            },
            { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
        );

        // Fetch course lectures to compute accurate updated progress
        const allLectures = await Lecture.find({ courseId }).sort({ lectureNumber: 1 });
        const totalLectures = allLectures.length;

        const allProgress = await Progress.find({ userId, courseId, completed: true });
        const completedCount = allProgress.length;
        const progressPercentage = totalLectures > 0 ? Math.min(100, Math.round((completedCount / totalLectures) * 100)) : 0;

        // Sync with Enrollment
        const lectureKey = `lecture-${lecture.lectureNumber}`;
        const enrollment = await Enrollment.findOne({ user: userId, course: courseId });
        if (enrollment) {
            let completedLessons = enrollment.completedLessons || [];
            if (shouldComplete && !completedLessons.includes(lectureKey)) {
                completedLessons.push(lectureKey);
            } else if (!shouldComplete && completedLessons.includes(lectureKey)) {
                completedLessons = completedLessons.filter((k) => k !== lectureKey && k !== String(lecture.lectureNumber));
            }
            enrollment.completedLessons = completedLessons;
            enrollment.progress = progressPercentage;
            await enrollment.save();
        } else if (shouldComplete) {
            await Enrollment.create({
                user: userId,
                course: courseId,
                completedLessons: [lectureKey],
                progress: progressPercentage,
            });
        }

        return res.status(200).json({
            success: true,
            message: shouldComplete ? "Lecture marked as completed" : "Lecture marked as incomplete",
            isCompleted: shouldComplete,
            progress: {
                lectureId: lecture._id,
                lectureNumber: lecture.lectureNumber,
                completed: progress.completed,
                completedAt: progress.completedAt,
                lastAccessedAt: progress.lastAccessedAt,
            },
            courseProgress: {
                courseId,
                totalLectures,
                completedCount,
                progressPercentage,
                isCourseCompleted: totalLectures > 0 && completedCount === totalLectures,
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to toggle lecture progress",
            error: error.message,
        });
    }
};

/**
 * Record lecture access (updates lastAccessedAt)
 * POST /api/progress/lecture/:lectureId/access
 */
const recordLectureAccess = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id;
        const { lectureId } = req.params;
        const lecture = await resolveLecture(lectureId);

        if (!lecture) {
            return res.status(404).json({
                success: false,
                message: "Lecture not found",
            });
        }

        if (!userId) {
            return res.status(200).json({
                success: true,
                message: "Guest access noted",
                lectureId: lecture._id,
            });
        }

        const now = new Date();
        const progress = await Progress.findOneAndUpdate(
            { userId, lectureId: lecture._id },
            {
                $set: {
                    userId,
                    courseId: lecture.courseId,
                    lectureId: lecture._id,
                    lastAccessedAt: now,
                },
                $setOnInsert: {
                    completed: false,
                    completedAt: null,
                },
            },
            { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
        );

        return res.status(200).json({
            success: true,
            message: "Lecture access recorded",
            lectureId: lecture._id,
            lastAccessedAt: progress.lastAccessedAt,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to record lecture access",
            error: error.message,
        });
    }
};

/**
 * Get comprehensive course progress for the current student
 * GET /api/progress/course/:courseId
 */
const getCourseProgress = async (req, res) => {
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
        const totalLectures = lectures.length;
        const modules = groupLecturesIntoModules(lectures, course);

        const userId = req.user?.id || req.user?._id;

        if (!userId) {
            // Unauthenticated / Guest response
            const modulesProgress = modules.map((mod) => ({
                moduleNumber: mod.moduleNumber,
                title: mod.title,
                completedLectures: 0,
                totalLectures: mod.totalLectures,
                progressPercentage: 0,
            }));

            return res.status(200).json({
                success: true,
                courseId: course._id,
                courseTitle: course.title,
                totalLectures,
                completedLectures: [],
                completedLectureIds: [],
                completedCount: 0,
                progressPercentage: 0,
                isCourseCompleted: false,
                modulesProgress,
                continueLearningLecture: lectures[0] ? {
                    _id: lectures[0]._id,
                    lectureNumber: lectures[0].lectureNumber,
                    title: lectures[0].title,
                    duration: lectures[0].duration,
                } : null,
                lastAccessedLecture: null,
            });
        }

        // Fetch all progress records for this user in this course
        const userProgressList = await Progress.find({ userId, courseId: course._id });

        // Map progress by lectureId string
        const progressMap = new Map();
        userProgressList.forEach((p) => {
            progressMap.set(String(p.lectureId), p);
        });

        const completedLectures = [];
        const completedLectureIds = [];

        lectures.forEach((lec) => {
            const p = progressMap.get(String(lec._id));
            if (p && p.completed) {
                completedLectures.push(lec.lectureNumber);
                completedLectureIds.push(String(lec._id));
            }
        });

        const completedCount = completedLectures.length;
        const progressPercentage = totalLectures > 0 ? Math.min(100, Math.round((completedCount / totalLectures) * 100)) : 0;
        const isCourseCompleted = totalLectures > 0 && completedCount === totalLectures;

        // Calculate Module-wise progress
        const completedNumbersSet = new Set(completedLectures);
        const modulesProgress = modules.map((mod) => {
            const modLectures = mod.lectures || [];
            const modCompletedCount = modLectures.filter((l) => completedNumbersSet.has(l.lectureNumber)).length;
            const modTotal = modLectures.length;
            const modPct = modTotal > 0 ? Math.round((modCompletedCount / modTotal) * 100) : 0;

            return {
                moduleNumber: mod.moduleNumber,
                title: mod.title,
                completedLectures: modCompletedCount,
                totalLectures: modTotal,
                progressPercentage: modPct,
            };
        });

        // Determine "Continue Learning" lecture:
        // Priority 1: The most recently accessed incomplete lecture.
        // Priority 2: If no incomplete lecture was accessed, the first incomplete lecture in sequential order.
        // Priority 3: If every lecture is completed, return null.
        let continueLearningLecture = null;
        let lastAccessedLecture = null;

        if (totalLectures > 0 && !isCourseCompleted) {
            // Sort progress records by lastAccessedAt descending
            const sortedByAccess = [...userProgressList].sort((a, b) => {
                const timeA = a.lastAccessedAt ? new Date(a.lastAccessedAt).getTime() : 0;
                const timeB = b.lastAccessedAt ? new Date(b.lastAccessedAt).getTime() : 0;
                return timeB - timeA;
            });

            // Check if there is an accessed lecture that is NOT completed
            for (const p of sortedByAccess) {
                if (!p.completed) {
                    const matched = lectures.find((l) => String(l._id) === String(p.lectureId));
                    if (matched) {
                        continueLearningLecture = {
                            _id: matched._id,
                            lectureNumber: matched.lectureNumber,
                            title: matched.title,
                            duration: matched.duration,
                        };
                        break;
                    }
                }
            }

            // If not found in access history, pick the first incomplete lecture by lectureNumber
            if (!continueLearningLecture) {
                const firstIncomplete = lectures.find((l) => !completedNumbersSet.has(l.lectureNumber));
                if (firstIncomplete) {
                    continueLearningLecture = {
                        _id: firstIncomplete._id,
                        lectureNumber: firstIncomplete.lectureNumber,
                        title: firstIncomplete.title,
                        duration: firstIncomplete.duration,
                    };
                }
            }

            // Also find most recently accessed lecture overall for reference
            if (sortedByAccess.length > 0) {
                const matchedLast = lectures.find((l) => String(l._id) === String(sortedByAccess[0].lectureId));
                if (matchedLast) {
                    lastAccessedLecture = {
                        _id: matchedLast._id,
                        lectureNumber: matchedLast.lectureNumber,
                        title: matchedLast.title,
                        duration: matchedLast.duration,
                        lastAccessedAt: sortedByAccess[0].lastAccessedAt,
                    };
                }
            }
        }

        return res.status(200).json({
            success: true,
            courseId: course._id,
            courseTitle: course.title,
            totalLectures,
            completedLectures,
            completedLectureIds,
            completedCount,
            progressPercentage,
            isCourseCompleted,
            modulesProgress,
            continueLearningLecture,
            lastAccessedLecture,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch course progress",
            error: error.message,
        });
    }
};

/**
 * Get progress status for a specific lecture
 * GET /api/progress/lecture/:lectureId
 */
const getLectureProgress = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        const { lectureId } = req.params;
        const lecture = await resolveLecture(lectureId);

        if (!lecture) {
            return res.status(404).json({
                success: false,
                message: "Lecture not found",
            });
        }

        const progress = await Progress.findOne({ userId, lectureId: lecture._id });

        return res.status(200).json({
            success: true,
            lectureId: lecture._id,
            lectureNumber: lecture.lectureNumber,
            courseId: lecture.courseId,
            completed: progress ? progress.completed : false,
            completedAt: progress ? progress.completedAt : null,
            lastAccessedAt: progress ? progress.lastAccessedAt : null,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch lecture progress",
            error: error.message,
        });
    }
};

module.exports = {
    markLectureComplete,
    toggleLectureComplete,
    recordLectureAccess,
    getCourseProgress,
    getLectureProgress,
};
