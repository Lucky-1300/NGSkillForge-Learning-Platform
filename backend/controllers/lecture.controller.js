const mongoose = require("mongoose");
const Course = require("../models/course.model");
const Lecture = require("../models/lecture.model");
const Enrollment = require("../models/enrollment.model");
const Progress = require("../models/progress.model");
const LectureContent = require("../models/lectureContent.model");
const { fetchPlaylistVideos } = require("../services/youtube.service");
const { getLectureContent } = require("../services/lectureContent.service");
const { resolveCourse, groupLecturesIntoModules } = require("../services/courseHelper");

/**
 * Get all lectures for a specific course
 * GET /api/lectures/course/:courseId
 */
const getLecturesByCourse = async (req, res) => {
    try {
        const { courseId } = req.params;
        const course = await resolveCourse(courseId);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found",
            });
        }

        const lectures = await Lecture.find({ courseId: course._id }).sort({
            lectureNumber: 1,
        });

        const modules = groupLecturesIntoModules(lectures, course);

        // Check completion status if user is logged in
        let completedLectures = [];
        const userId = req.user?.id || req.user?._id;
        if (userId) {
            const progressList = await Progress.find({ userId, courseId: course._id, completed: true });
            if (progressList.length > 0) {
                const completedIds = new Set(progressList.map((p) => String(p.lectureId)));
                completedLectures = lectures
                    .filter((l) => completedIds.has(String(l._id)))
                    .map((l) => l.lectureNumber);
            } else {
                const enrollment = await Enrollment.findOne({
                    user: userId,
                    course: course._id,
                });
                if (enrollment && enrollment.completedLessons) {
                    completedLectures = enrollment.completedLessons
                        .map((item) => {
                            const parsed = parseInt(item.replace(/^lecture-/, ""), 10);
                            return isNaN(parsed) ? null : parsed;
                        })
                        .filter((n) => n !== null);
                }
            }
        }

        return res.status(200).json({
            success: true,
            course: {
                _id: course._id,
                title: course.title,
                description: course.description,
                instructor: course.instructor,
                category: course.category,
                level: course.level,
                duration: course.duration,
            },
            totalLectures: lectures.length,
            completedLectures,
            progressPercent: lectures.length > 0 ? Math.round((completedLectures.length / lectures.length) * 100) : 0,
            modules,
            lectures,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch lectures",
            error: error.message,
        });
    }
};

/**
 * Get a specific lecture by course and lecture number with rich content
 * GET /api/lectures/course/:courseId/:lectureNumber
 */
const getLectureByNumber = async (req, res) => {
    try {
        const { courseId, lectureNumber } = req.params;
        const course = await resolveCourse(courseId);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found",
            });
        }

        const targetNum = parseInt(lectureNumber, 10);
        if (isNaN(targetNum)) {
            return res.status(400).json({
                success: false,
                message: "Invalid lecture number",
            });
        }

        const lecture = await Lecture.findOne({
            courseId: course._id,
            lectureNumber: targetNum,
        });

        if (!lecture) {
            return res.status(404).json({
                success: false,
                message: `Lecture #${targetNum} not found for this course`,
            });
        }

        const totalLectures = await Lecture.countDocuments({
            courseId: course._id,
        });

        const allLectures = await Lecture.find({ courseId: course._id })
            .select("lectureNumber title duration youtubeVideoId thumbnailUrl")
            .sort({ lectureNumber: 1 });

        const modules = groupLecturesIntoModules(allLectures, course);

        // Find which module this lecture belongs to
        const currentModule = modules.find(
            (m) => targetNum >= m.startLecture && targetNum <= m.endLecture
        ) || {
            moduleNumber: 1,
            title: "Module 1: Core Lectures",
        };

        const prevLecture =
            targetNum > 1
                ? await Lecture.findOne({
                      courseId: course._id,
                      lectureNumber: targetNum - 1,
                  }).select("lectureNumber title duration youtubeVideoId")
                : null;

        const nextLecture =
            targetNum < totalLectures
                ? await Lecture.findOne({
                      courseId: course._id,
                      lectureNumber: targetNum + 1,
                  }).select("lectureNumber title duration youtubeVideoId")
                : null;

        // Fetch / generate rich notes, practice tasks, and MCQs
        const content = await getLectureContent(course, lecture);

        // Check user completion & record access
        let isCompleted = false;
        let completedLectures = [];
        const userId = req.user?.id || req.user?._id;

        if (userId) {
            // Update lastAccessedAt in Progress model
            await Progress.findOneAndUpdate(
                { userId, lectureId: lecture._id },
                {
                    $set: {
                        userId,
                        courseId: course._id,
                        lectureId: lecture._id,
                        lastAccessedAt: new Date(),
                    },
                    $setOnInsert: {
                        completed: false,
                        completedAt: null,
                    },
                },
                { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
            );

            const progressList = await Progress.find({ userId, courseId: course._id, completed: true });
            if (progressList.length > 0) {
                const completedIds = new Set(progressList.map((p) => String(p.lectureId)));
                completedLectures = allLectures
                    .filter((l) => completedIds.has(String(l._id)))
                    .map((l) => l.lectureNumber);
                isCompleted = completedIds.has(String(lecture._id));
            } else {
                const enrollment = await Enrollment.findOne({
                    user: userId,
                    course: course._id,
                });
                if (enrollment && enrollment.completedLessons) {
                    isCompleted = enrollment.completedLessons.includes(`lecture-${targetNum}`) || enrollment.completedLessons.includes(String(targetNum));
                    completedLectures = enrollment.completedLessons
                        .map((item) => {
                            const parsed = parseInt(item.replace(/^lecture-/, ""), 10);
                            return isNaN(parsed) ? null : parsed;
                        })
                        .filter((n) => n !== null);
                }
            }
        }

        return res.status(200).json({
            success: true,
            course: {
                _id: course._id,
                title: course.title,
                category: course.category,
                level: course.level,
                instructor: course.instructor,
                duration: course.duration,
            },
            lecture,
            module: currentModule,
            modules,
            content,
            isCompleted,
            completedLectures,
            progressPercent: totalLectures > 0 ? Math.round((completedLectures.length / totalLectures) * 100) : 0,
            navigation: {
                current: targetNum,
                totalLectures,
                prevLecture,
                nextLecture,
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch lecture",
            error: error.message,
        });
    }
};

/**
 * Toggle lecture completion status
 * POST /api/lectures/course/:courseId/:lectureNumber/toggle-complete
 */
const toggleLectureComplete = async (req, res) => {
    try {
        const { courseId, lectureNumber } = req.params;
        const targetNum = parseInt(lectureNumber, 10);
        const course = await resolveCourse(courseId);

        if (!course) {
            return res.status(404).json({ success: false, message: "Course not found" });
        }

        const lectureDoc = await Lecture.findOne({ courseId: course._id, lectureNumber: targetNum });
        if (!lectureDoc) {
            return res.status(404).json({ success: false, message: `Lecture #${targetNum} not found` });
        }

        const totalLectures = await Lecture.countDocuments({ courseId: course._id });
        const lectureKey = `lecture-${targetNum}`;
        const userId = req.user?.id || req.user?._id;

        if (!userId) {
            // Guest user - inform client to use localStorage
            return res.status(200).json({
                success: true,
                guest: true,
                lectureNumber: targetNum,
                message: "Guest completion toggled",
            });
        }

        // Check current completion state in Progress model
        const currentProgress = await Progress.findOne({ userId, lectureId: lectureDoc._id });
        const willBeCompleted = !currentProgress || !currentProgress.completed;
        const now = new Date();

        await Progress.findOneAndUpdate(
            { userId, lectureId: lectureDoc._id },
            {
                $set: {
                    userId,
                    courseId: course._id,
                    lectureId: lectureDoc._id,
                    completed: willBeCompleted,
                    completedAt: willBeCompleted ? now : null,
                    lastAccessedAt: now,
                },
            },
            { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
        );

        // Also sync Enrollment model
        let enrollment = await Enrollment.findOne({
            user: userId,
            course: course._id,
        });

        if (!enrollment) {
            enrollment = await Enrollment.create({
                user: userId,
                course: course._id,
                completedLessons: willBeCompleted ? [lectureKey] : [],
                progress: totalLectures > 0 && willBeCompleted ? Math.round((1 / totalLectures) * 100) : 0,
            });
        } else {
            const index = enrollment.completedLessons.indexOf(lectureKey);
            const legacyIndex = enrollment.completedLessons.indexOf(String(targetNum));

            if (!willBeCompleted) {
                if (index > -1) enrollment.completedLessons.splice(index, 1);
                if (legacyIndex > -1) enrollment.completedLessons.splice(legacyIndex, 1);
            } else {
                if (index === -1) enrollment.completedLessons.push(lectureKey);
            }

            const completedCount = enrollment.completedLessons.length;
            enrollment.progress = totalLectures > 0 ? Math.min(100, Math.round((completedCount / totalLectures) * 100)) : 0;
            await enrollment.save();
        }

        const allUserProgress = await Progress.find({ userId, courseId: course._id, completed: true });
        const allLectures = await Lecture.find({ courseId: course._id }).select("lectureNumber");
        const completedIdsSet = new Set(allUserProgress.map((p) => String(p.lectureId)));
        const completedNumbers = allLectures
            .filter((l) => completedIdsSet.has(String(l._id)))
            .map((l) => l.lectureNumber);

        const progressPercent = totalLectures > 0 ? Math.min(100, Math.round((completedNumbers.length / totalLectures) * 100)) : 0;

        return res.status(200).json({
            success: true,
            isCompleted: willBeCompleted,
            completedLectures: completedNumbers,
            progressPercent,
            totalLectures,
            message: willBeCompleted ? "Lecture marked as completed" : "Lecture marked as incomplete",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to toggle lecture completion",
            error: error.message,
        });
    }
};

/**
 * Import or sync YouTube playlist lectures into a course
 * POST /api/lectures/import-playlist
 */
const importPlaylistLectures = async (req, res) => {
    try {
        const { courseId, playlistId } = req.body;

        if (!playlistId) {
            return res.status(400).json({
                success: false,
                message: "Playlist ID is required",
            });
        }

        const course = await resolveCourse(courseId);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Target course not found",
            });
        }

        const videos = await fetchPlaylistVideos(playlistId);

        if (!videos || !videos.length) {
            return res.status(400).json({
                success: false,
                message: "No videos found in the specified playlist",
            });
        }

        const operations = videos.map((video) => ({
            updateOne: {
                filter: {
                    courseId: course._id,
                    lectureNumber: video.lectureNumber,
                },
                update: {
                    $set: {
                        courseId: course._id,
                        lectureNumber: video.lectureNumber,
                        title: video.title,
                        youtubeVideoId: video.youtubeVideoId,
                        youtubeUrl: video.youtubeUrl,
                        thumbnailUrl: video.thumbnailUrl,
                        duration: video.duration,
                        playlistId: video.playlistId,
                    },
                },
                upsert: true,
            },
        }));

        await Lecture.bulkWrite(operations);

        const updatedLectures = await Lecture.find({
            courseId: course._id,
        }).sort({ lectureNumber: 1 });

        return res.status(200).json({
            success: true,
            message: `Successfully imported ${updatedLectures.length} lectures for "${course.title}"`,
            courseTitle: course.title,
            totalLectures: updatedLectures.length,
            lectures: updatedLectures,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to import playlist lectures",
            error: error.message,
        });
    }
};

module.exports = {
    getLecturesByCourse,
    getLectureByNumber,
    toggleLectureComplete,
    importPlaylistLectures,
};
