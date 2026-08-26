// This file handles course create, read, update, delete, search, and pagination.
const mongoose = require("mongoose");
const Course = require("../models/course.model");
const Enrollment = require("../models/enrollment.model");

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const createCourse = async (req, res) => {
    try {
        // Save the course exactly as sent in the request body.
        const course = await Course.create(req.body);

        return res.status(201).json({
            success: true,
            message: "Course created successfully",
            course,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to create course",
            error: error.message,
        });
    }
};

const getAllCourses = async (req, res) => {
    try {
        // Read pagination and search values from the query string.
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 5;
        const skip = (page - 1) * limit;
        const search = req.query.search || "";
        const category = req.query.category || "";

        const filter = {};

        // Search by course title if the user passes ?search=...
        if (search) {
            filter.title = {
                $regex: escapeRegex(search),
                $options: "i",
            };
        }

        // Filter courses by category if ?category=... is provided.
        if (category) {
            filter.category = category;
        }

        if (req.query.level) {
            filter.level = req.query.level;
        }

        // Keep full lesson content out of the public catalog payload.
        const courses = await Course.find(filter)
            .select("-modules")
            .sort({ order: 1, _id: 1 })
            .skip(skip)
            .limit(limit);

        const totalCourses = await Course.countDocuments(filter);

        return res.status(200).json({
            success: true,
            totalCourses,
            currentPage: page,
            totalPages: Math.ceil(totalCourses / limit),
            courses,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch courses",
            error: error.message,
        });
    }
};

const getSingleCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found",
            });
        }

        return res.status(200).json({
            success: true,
            course,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch course",
            error: error.message,
        });
    }
};

const getCourseContent = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id)
            .select("title description instructor category level duration modules");

        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found",
            });
        }

        const isAdmin = req.user?.role === "admin";

        let isEnrolled = false;
        if (!isAdmin) {
            const enrollment = await Enrollment.findOne({
                user: req.user.id,
                course: req.params.id,
            }).select("_id");

            isEnrolled = Boolean(enrollment);
        }

        if (!isAdmin && !isEnrolled) {
            return res.status(403).json({
                success: false,
                message: "Access denied. Enroll in this course to view content",
            });
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
                modules: course.modules,
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch course content",
            error: error.message,
        });
    }
};

const updateCourse = async (req, res) => {
    try {
        // Update only the fields that come in the request body.
        const updatedCourse = await Course.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
            }
        );

        if (!updatedCourse) {
            return res.status(404).json({
                success: false,
                message: "Course not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Course updated successfully",
            updatedCourse,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to update course",
            error: error.message,
        });
    }
};

const deleteCourse = async (req, res) => {
    try {
        // Remove the course from MongoDB using its id.
        const deletedCourse = await Course.findByIdAndDelete(
            req.params.id
        );

        if (!deletedCourse) {
            return res.status(404).json({
                success: false,
                message: "Course not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Course deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to delete course",
            error: error.message,
        });
    }
};

const getSubtopicLesson = async (req, res) => {
    try {
        const { courseId, topicId, subtopicId } = req.params;

        // Find course by ObjectId or fallback to title regex
        let course = null;
        if (mongoose.Types.ObjectId.isValid(courseId)) {
            course = await Course.findById(courseId);
        }
        if (!course) {
            const cleanTitle = courseId.replace(/-/g, " ");
            course = await Course.findOne({
                title: new RegExp(`^${cleanTitle}$`, "i"),
            });
        }

        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found",
            });
        }

        // Check if user is enrolled or admin
        const isAdmin = req.user && req.user.role === "admin";
        let enrollment = null;
        if (req.user) {
            enrollment = await Enrollment.findOne({
                user: req.user.id,
                course: course._id,
            });
        }

        // If not enrolled and not admin, if course is free ($0), we can auto-enroll or require enrollment
        if (!enrollment && !isAdmin) {
            // Auto-enroll if free, else prompt enrollment
            if (!course.price || Number(course.price) === 0) {
                enrollment = await Enrollment.create({
                    user: req.user.id,
                    course: course._id,
                });
            } else {
                return res.status(403).json({
                    success: false,
                    message: "You must be enrolled in this course to access lesson content",
                    requiresEnrollment: true,
                    courseId: course._id,
                });
            }
        }

        if (!course.modules || course.modules.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No modules found for this course",
            });
        }

        // Resolve target module
        const topicNum = Number(topicId);
        let targetModule = null;
        if (!isNaN(topicNum)) {
            targetModule = course.modules.find(
                (m) => m.order === topicNum
            ) || course.modules[topicNum - 1];
        }
        if (!targetModule) {
            targetModule = course.modules.find((m) =>
                m.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").includes(topicId.toLowerCase())
            );
        }

        if (!targetModule) {
            return res.status(404).json({
                success: false,
                message: "Topic not found",
            });
        }

        // Resolve target subtopic/lesson
        const subtopicNum = Number(subtopicId);
        let targetLesson = null;
        if (!isNaN(subtopicNum)) {
            targetLesson = (targetModule.lessons || []).find(
                (l) => l.order === subtopicNum
            ) || targetModule.lessons[subtopicNum - 1];
        }
        if (!targetLesson) {
            targetLesson = (targetModule.lessons || []).find((l) =>
                l.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").includes(subtopicId.toLowerCase())
            );
        }

        if (!targetLesson) {
            return res.status(404).json({
                success: false,
                message: "Subtopic lesson not found",
            });
        }

        // Build flattened lesson list for sequential previous/next navigation
        const flatLessons = [];
        course.modules.forEach((mod) => {
            (mod.lessons || []).forEach((les) => {
                flatLessons.push({
                    topicOrder: mod.order,
                    topicTitle: mod.title,
                    subtopicOrder: les.order,
                    subtopicTitle: les.title,
                    lessonKey: `${mod.order}-${les.order}`,
                    duration: les.duration,
                });
            });
        });

        const currentFlatIndex = flatLessons.findIndex(
            (item) => item.topicOrder === targetModule.order && item.subtopicOrder === targetLesson.order
        );

        const prevLesson = currentFlatIndex > 0 ? flatLessons[currentFlatIndex - 1] : null;
        const nextLesson = currentFlatIndex >= 0 && currentFlatIndex < flatLessons.length - 1 ? flatLessons[currentFlatIndex + 1] : null;

        const completedLessons = enrollment?.completedLessons || [];
        const completedQuestions = enrollment?.completedQuestions || [];
        const completedTasks = enrollment?.completedTasks || [];
        const currentLessonKey = `${targetModule.order}-${targetLesson.order}`;
        const isCurrentCompleted = completedLessons.includes(currentLessonKey);
        const progress = enrollment?.progress || (flatLessons.length ? Math.min(100, Math.round((completedLessons.length / flatLessons.length) * 100)) : 0);

        // Map subtopic-level questions with fallback IDs and completion status
        const lessonQuestions = (targetLesson.questions || []).map((q, idx) => {
            const qObj = q.toObject ? q.toObject() : q;
            const qId = qObj.id || `q-${targetModule.order}-${targetLesson.order}-${idx + 1}`;
            return {
                ...qObj,
                id: qId,
                isCompleted: completedQuestions.includes(qId),
            };
        });

        // Map subtopic-level tasks with fallback IDs and completion status
        const lessonTasks = (targetLesson.tasks || []).map((t, idx) => {
            const tObj = t.toObject ? t.toObject() : t;
            const tId = tObj.id || `t-${targetModule.order}-${targetLesson.order}-${tObj.taskNumber || idx + 1}`;
            return {
                ...tObj,
                id: tId,
                isCompleted: completedTasks.includes(tId),
            };
        });

        // Build full curriculum tree for sidebar navigation
        const curriculum = course.modules.map((mod) => ({
            order: mod.order,
            title: mod.title,
            lessons: (mod.lessons || []).map((les) => {
                const key = `${mod.order}-${les.order}`;
                return {
                    order: les.order,
                    title: les.title,
                    duration: les.duration,
                    lessonKey: key,
                    isCompleted: completedLessons.includes(key),
                };
            }),
        }));

        return res.status(200).json({
            success: true,
            course: {
                _id: course._id,
                title: course.title,
                category: course.category,
                level: course.level,
                instructor: course.instructor,
                notesDocUrl: course.notesDocUrl || "",
            },
            topic: {
                order: targetModule.order,
                title: targetModule.title,
                notesDocUrl: targetModule.notesDocUrl || "",
            },
            subtopic: {
                order: targetLesson.order,
                title: targetLesson.title,
                type: targetLesson.type,
                content: targetLesson.content,
                notes: targetLesson.notes,
                duration: targetLesson.duration,
                lessonKey: currentLessonKey,
                isCompleted: isCurrentCompleted,
                questions: lessonQuestions,
                tasks: lessonTasks,
            },
            navigation: {
                prev: prevLesson,
                next: nextLesson,
                currentIndex: currentFlatIndex + 1,
                totalLessons: flatLessons.length,
            },
            curriculum,
            completedLessons,
            completedQuestions,
            completedTasks,
            progress,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch subtopic lesson",
            error: error.message,
        });
    }
};

const getTopicDetails = async (req, res) => {
    try {
        const { courseId, topicId } = req.params;

        let course = null;
        if (mongoose.Types.ObjectId.isValid(courseId)) {
            course = await Course.findById(courseId);
        }
        if (!course) {
            const cleanTitle = courseId.replace(/-/g, " ");
            course = await Course.findOne({
                title: new RegExp(`^${cleanTitle}$`, "i"),
            });
        }

        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found",
            });
        }

        // Enrollment check / auto-enroll if free
        const isAdmin = req.user && req.user.role === "admin";
        let enrollment = null;
        if (req.user) {
            enrollment = await Enrollment.findOne({
                user: req.user.id,
                course: course._id,
            });
        }

        if (!enrollment && !isAdmin) {
            if (!course.price || Number(course.price) === 0) {
                enrollment = await Enrollment.create({
                    user: req.user.id,
                    course: course._id,
                });
            } else {
                return res.status(403).json({
                    success: false,
                    message: "You must be enrolled in this course to access this topic",
                    requiresEnrollment: true,
                    courseId: course._id,
                });
            }
        }

        // Find topic
        const topicNum = Number(topicId);
        let targetModule = null;
        if (!isNaN(topicNum)) {
            targetModule = (course.modules || []).find(
                (m) => m.order === topicNum
            ) || (course.modules || [])[topicNum - 1];
        }
        if (!targetModule) {
            targetModule = (course.modules || []).find((m) =>
                m.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").includes(topicId.toLowerCase())
            );
        }

        if (!targetModule) {
            return res.status(404).json({
                success: false,
                message: "Topic not found",
            });
        }

        const completedLessons = enrollment?.completedLessons || [];
        const completedQuestions = enrollment?.completedQuestions || [];
        const completedTasks = enrollment?.completedTasks || [];

        const lessons = (targetModule.lessons || []).map((les) => {
            const key = `${targetModule.order}-${les.order}`;
            const lessonObj = les.toObject ? les.toObject() : les;

            const lessonQuestions = (lessonObj.questions || []).map((q, idx) => {
                const qObj = q.toObject ? q.toObject() : q;
                const qId = qObj.id || `q-${targetModule.order}-${les.order}-${idx + 1}`;
                return {
                    ...qObj,
                    id: qId,
                    isCompleted: completedQuestions.includes(qId),
                };
            });

            const lessonTasks = (lessonObj.tasks || []).map((t, idx) => {
                const tObj = t.toObject ? t.toObject() : t;
                const tId = tObj.id || `t-${targetModule.order}-${les.order}-${tObj.taskNumber || idx + 1}`;
                return {
                    ...tObj,
                    id: tId,
                    isCompleted: completedTasks.includes(tId),
                };
            });

            return {
                order: les.order,
                title: les.title,
                content: les.content,
                notes: les.notes,
                duration: les.duration,
                lessonKey: key,
                isCompleted: completedLessons.includes(key),
                questions: lessonQuestions,
                tasks: lessonTasks,
            };
        });

        // Module-level questions (for backward compatibility with existing courses)
        const moduleQuestions = (targetModule.questions || []).map((q, idx) => {
            const qObj = q.toObject ? q.toObject() : q;
            const qId = qObj.id || `q-${targetModule.order}-${idx + 1}`;
            return {
                ...qObj,
                id: qId,
                isCompleted: completedQuestions.includes(qId),
            };
        });

        // Aggregate lesson-level questions across subtopics if any exist, otherwise fallback to module level
        const allLessonQuestions = lessons.flatMap((l) => l.questions || []);
        const questions = allLessonQuestions.length > 0 ? allLessonQuestions : moduleQuestions;

        // Module-level tasks (for backward compatibility with existing courses)
        const moduleTasks = (targetModule.tasks || []).map((t, idx) => {
            const tObj = t.toObject ? t.toObject() : t;
            const tId = tObj.id || `t-${targetModule.order}-${tObj.taskNumber || idx + 1}`;
            return {
                ...tObj,
                id: tId,
                isCompleted: completedTasks.includes(tId),
            };
        });

        // Aggregate lesson-level tasks across subtopics if any exist, otherwise fallback to module level
        const allLessonTasks = lessons.flatMap((l) => l.tasks || []);
        const tasks = allLessonTasks.length > 0 ? allLessonTasks : moduleTasks;

        const totalLessons = lessons.length;
        const completedLessonsCount = lessons.filter((l) => l.isCompleted).length;
        const lessonsProgress = totalLessons ? Math.round((completedLessonsCount / totalLessons) * 100) : 0;

        const totalQuestions = questions.length;
        const completedQuestionsCount = questions.filter((q) => q.isCompleted).length;
        const questionsProgress = totalQuestions ? Math.round((completedQuestionsCount / totalQuestions) * 100) : 0;

        const totalTasks = tasks.length;
        const completedTasksCount = tasks.filter((t) => t.isCompleted).length;
        const tasksProgress = totalTasks ? Math.round((completedTasksCount / totalTasks) * 100) : 0;

        const weightsCount = (totalLessons > 0 ? 1 : 0) + (totalQuestions > 0 ? 1 : 0) + (totalTasks > 0 ? 1 : 0);
        const overallProgress = weightsCount > 0
            ? Math.round((lessonsProgress + questionsProgress + tasksProgress) / weightsCount)
            : 0;

        return res.status(200).json({
            success: true,
            course: {
                _id: course._id,
                title: course.title,
                category: course.category,
                level: course.level,
                notesDocUrl: course.notesDocUrl || "",
            },
            topic: {
                order: targetModule.order,
                title: targetModule.title,
                description: targetModule.description || 'Master this topic through subtopic lessons, interactive questions, and hands-on coding tasks.',
                notesDocUrl: targetModule.notesDocUrl || "",
                lessons,
                questions,
                tasks,
            },
            stats: {
                totalLessons,
                completedLessonsCount,
                lessonsProgress,
                totalQuestions,
                completedQuestionsCount,
                questionsProgress,
                totalTasks,
                completedTasksCount,
                tasksProgress,
                overallProgress,
            },
            completedLessons,
            completedQuestions,
            completedTasks,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch topic details",
            error: error.message,
        });
    }
};

module.exports = {
    createCourse,
    getAllCourses,
    getSingleCourse,
    getCourseContent,
    getSubtopicLesson,
    getTopicDetails,
    updateCourse,
    deleteCourse,
};
