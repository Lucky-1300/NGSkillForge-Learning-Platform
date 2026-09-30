const mongoose = require("mongoose");
const User = require("../models/user.model");
const Course = require("../models/course.model");
const Enrollment = require("../models/enrollment.model");
const Progress = require("../models/progress.model");
const Assessment = require("../models/assessment.model");
const AssessmentAttempt = require("../models/assessmentAttempt.model");
const Certificate = require("../models/certificate.model");
const Lecture = require("../models/lecture.model");

/**
 * Helper to build Date Match filter from timeRange query param
 */
function getDateFilter(timeRange, field = "createdAt") {
    if (!timeRange || timeRange === "all") return {};

    const now = new Date();
    let startDate = null;

    if (timeRange === "today") {
        startDate = new Date(now.setHours(0, 0, 0, 0));
    } else if (timeRange === "7d") {
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    } else if (timeRange === "30d") {
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    } else if (timeRange === "90d") {
        startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    }

    if (startDate) {
        return { [field]: { $gte: startDate } };
    }
    return {};
}

/**
 * GET /api/admin/analytics/overview
 * Consolidated Admin Platform Analytics & Insights
 */
const getPlatformAnalytics = async (req, res) => {
    try {
        const { timeRange = "all", courseId } = req.query;

        // Build course filter object if courseId is passed
        let courseMatchObj = {};
        let courseObjId = null;
        if (courseId && courseId !== "all" && mongoose.Types.ObjectId.isValid(courseId)) {
            courseObjId = new mongoose.Types.ObjectId(courseId);
            courseMatchObj = { courseId: courseObjId };
        }

        const dateFilterEnrollment = getDateFilter(timeRange, "createdAt");
        const dateFilterProgress = getDateFilter(timeRange, "updatedAt");
        const dateFilterAttempt = getDateFilter(timeRange, "submittedAt");
        const dateFilterCertificate = getDateFilter(timeRange, "issuedAt");

        // 1. TOP SUMMARY METRICS
        const [totalStudentsCount, totalCoursesCount] = await Promise.all([
            User.countDocuments({ role: "user" }),
            Course.countDocuments(),
        ]);

        // Active Students (Unique users with activity in selected timeframe or last 30d)
        const activeUsersDate = timeRange !== "all" ? dateFilterProgress.updatedAt?.$gte || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const [activeProgressUsers, activeAttemptUsers] = await Promise.all([
            Progress.distinct("userId", { updatedAt: { $gte: activeUsersDate } }),
            AssessmentAttempt.distinct("userId", { createdAt: { $gte: activeUsersDate } }),
        ]);
        const activeUsersSet = new Set([...activeProgressUsers.map(String), ...activeAttemptUsers.map(String)]);
        const activeStudentsCount = activeUsersSet.size;

        // Enrollments & Completions
        const enrollmentQuery = { ...dateFilterEnrollment };
        if (courseObjId) {
            enrollmentQuery.course = courseObjId;
        }

        const [totalEnrollmentsCount, completedEnrollmentsCount] = await Promise.all([
            Enrollment.countDocuments(enrollmentQuery),
            Enrollment.countDocuments({ ...enrollmentQuery, courseCompleted: true }),
        ]);

        // Certificates Issued
        const certQuery = { ...dateFilterCertificate };
        if (courseObjId) {
            certQuery.courseId = courseObjId;
        }
        const certificatesIssuedCount = await Certificate.countDocuments(certQuery);

        const overallCompletionRate = totalEnrollmentsCount > 0
            ? Number(((completedEnrollmentsCount / totalEnrollmentsCount) * 100).toFixed(1))
            : null;

        // 2. COURSE PERFORMANCE TABLE & COMPLETION METRICS
        const coursesList = await Course.find().select("title category level duration createdAt").sort({ title: 1 });

        const coursePerformance = [];
        for (const c of coursesList) {
            if (courseObjId && c._id.toString() !== courseObjId.toString()) {
                continue;
            }

            const cId = c._id;
            const [enrolled, completed, certs, attempts] = await Promise.all([
                Enrollment.countDocuments({ course: cId, ...dateFilterEnrollment }),
                Enrollment.countDocuments({ course: cId, courseCompleted: true, ...dateFilterEnrollment }),
                Certificate.countDocuments({ courseId: cId, ...dateFilterCertificate }),
                AssessmentAttempt.find({ courseId: cId, ...dateFilterAttempt }).select("percentage passed"),
            ]);

            const inProgress = Math.max(0, enrolled - completed);
            const completionRate = enrolled > 0 ? Number(((completed / enrolled) * 100).toFixed(1)) : null;

            let avgScore = null;
            let passRate = null;
            if (attempts.length > 0) {
                const totalScore = attempts.reduce((acc, att) => acc + (att.percentage || 0), 0);
                avgScore = Number((totalScore / attempts.length).toFixed(1));
                const passedCount = attempts.filter((att) => att.passed).length;
                passRate = Number(((passedCount / attempts.length) * 100).toFixed(1));
            }

            coursePerformance.push({
                courseId: c._id,
                title: c.title,
                category: c.category || "General",
                level: c.level || "All Levels",
                totalStudents: enrolled,
                inProgress,
                completed,
                completionRate,
                averageAssessmentScore: avgScore,
                totalCertificates: certs,
                totalAttempts: attempts.length,
                passRate,
            });
        }

        // 3. ASSESSMENT ANALYTICS
        const attemptQuery = { ...dateFilterAttempt };
        if (courseObjId) {
            attemptQuery.courseId = courseObjId;
        }

        const allAttempts = await AssessmentAttempt.find(attemptQuery).select("userId percentage passed submittedAt courseId");
        const totalAttempts = allAttempts.length;
        const passedAttempts = allAttempts.filter((a) => a.passed).length;
        const failedAttempts = totalAttempts - passedAttempts;

        const assessmentPassRate = totalAttempts > 0 ? Number(((passedAttempts / totalAttempts) * 100).toFixed(1)) : null;
        const assessmentFailRate = totalAttempts > 0 ? Number(((failedAttempts / totalAttempts) * 100).toFixed(1)) : null;

        const avgAssessmentScore = totalAttempts > 0
            ? Number((allAttempts.reduce((sum, a) => sum + (a.percentage || 0), 0) / totalAttempts).toFixed(1))
            : null;

        const uniqueAttemptStudents = new Set(allAttempts.map((a) => a.userId.toString())).size;
        const avgAttemptsPerStudent = uniqueAttemptStudents > 0
            ? Number((totalAttempts / uniqueAttemptStudents).toFixed(1))
            : null;

        // 4. DIFFICULT CONTENT & CHALLENGING TOPICS (Real Assessment Question Error Rate Analysis)
        const attemptsWithAnswers = await AssessmentAttempt.find(attemptQuery).select("answers courseId");
        const questionStats = new Map();

        attemptsWithAnswers.forEach((att) => {
            if (Array.isArray(att.answers)) {
                att.answers.forEach((ans) => {
                    if (ans && ans.questionId) {
                        const qKey = ans.questionId.toString();
                        if (!questionStats.has(qKey)) {
                            questionStats.set(qKey, {
                                questionId: ans.questionId,
                                total: 0,
                                incorrect: 0,
                                explanation: ans.explanation || "",
                            });
                        }
                        const stat = questionStats.get(qKey);
                        stat.total += 1;
                        if (!ans.isCorrect) {
                            stat.incorrect += 1;
                        }
                    }
                });
            }
        });

        // Resolve question text from Assessment collection
        const difficultTopics = [];
        if (questionStats.size > 0) {
            const allAssessments = await Assessment.find().select("questions courseId");
            const qMap = new Map();
            allAssessments.forEach((ass) => {
                if (Array.isArray(ass.questions)) {
                    ass.questions.forEach((q) => {
                        qMap.set(q._id.toString(), {
                            questionText: q.question,
                            difficulty: q.difficulty || "Medium",
                            courseId: ass.courseId,
                        });
                    });
                }
            });

            for (const [qId, stat] of questionStats.entries()) {
                const qMeta = qMap.get(qId);
                const errorRate = stat.total > 0 ? Number(((stat.incorrect / stat.total) * 100).toFixed(1)) : 0;
                if (stat.total >= 1) {
                    difficultTopics.push({
                        questionId: qId,
                        topic: qMeta?.questionText || `Question (${qId.slice(-6)})`,
                        difficulty: qMeta?.difficulty || "Medium",
                        totalAttempts: stat.total,
                        incorrectAttempts: stat.incorrect,
                        errorRate,
                    });
                }
            }
            // Sort by highest error rate descending
            difficultTopics.sort((a, b) => b.errorRate - a.errorRate);
        }

        // 5. LECTURE ENGAGEMENT (Most vs Least Completed Lectures)
        const progressLectureMatch = courseObjId ? { courseId: courseObjId, completed: true } : { completed: true };
        const lectureCompletions = await Progress.aggregate([
            { $match: progressLectureMatch },
            { $group: { _id: "$lectureId", completedCount: { $sum: 1 }, courseId: { $first: "$courseId" } } },
            { $sort: { completedCount: -1 } },
        ]);

        let mostCompletedLectures = [];
        let leastCompletedLectures = [];

        if (lectureCompletions.length > 0) {
            const lectureIds = lectureCompletions.map((lc) => lc._id);
            const lecturesData = await Lecture.find({ _id: { $in: lectureIds } }).select("title lectureNumber courseId moduleTitle").populate("courseId", "title");
            const lectureMap = new Map(lecturesData.map((l) => [l._id.toString(), l]));

            const enriched = lectureCompletions.map((lc) => {
                const lDoc = lectureMap.get(lc._id.toString());
                return {
                    lectureId: lc._id,
                    title: lDoc ? lDoc.title : "Lecture",
                    lectureNumber: lDoc?.lectureNumber || 1,
                    moduleTitle: lDoc?.moduleTitle || "",
                    courseTitle: lDoc?.courseId?.title || "Course",
                    completedCount: lc.completedCount,
                };
            });

            mostCompletedLectures = enriched.slice(0, 5);
            leastCompletedLectures = [...enriched].reverse().slice(0, 5);
        }

        // 6. CERTIFICATE ANALYTICS
        const certsByCourseAgg = await Certificate.aggregate([
            { $match: certQuery },
            { $group: { _id: "$courseName", count: { $sum: 1 }, avgScore: { $avg: "$assessmentScore" } } },
            { $sort: { count: -1 } },
        ]);

        const certificatesByCourse = certsByCourseAgg.map((item) => ({
            courseName: item._id,
            certificatesCount: item.count,
            averageScore: Math.round(item.avgScore || 0),
        }));

        const completionToCertificateRatio = completedEnrollmentsCount > 0
            ? Number(((certificatesIssuedCount / completedEnrollmentsCount) * 100).toFixed(1))
            : null;

        // 7. AI TUTOR USAGE (Accurate Status Notice - No fake data)
        const aiAnalytics = {
            isPersisted: false,
            message: "AI usage analytics will appear once AI conversations are stored.",
            totalQuestions: 0,
            activeAIUsers: 0,
        };

        // 8. REAL RECENT ACTIVITY LOG (Chronological real events, sanitized)
        const [recentEnrollments, recentProgress, recentAttemptsList, recentCerts] = await Promise.all([
            Enrollment.find({ courseCompleted: true, ...dateFilterEnrollment })
                .sort({ completedAt: -1, updatedAt: -1 })
                .limit(4)
                .populate("user", "name")
                .populate("course", "title"),
            Progress.find({ completed: true, ...dateFilterProgress })
                .sort({ completedAt: -1, updatedAt: -1 })
                .limit(4)
                .populate("userId", "name")
                .populate("lectureId", "title lectureNumber")
                .populate("courseId", "title"),
            AssessmentAttempt.find(attemptQuery)
                .sort({ submittedAt: -1, createdAt: -1 })
                .limit(4)
                .populate("userId", "name")
                .populate("courseId", "title"),
            Certificate.find(certQuery)
                .sort({ issuedAt: -1, createdAt: -1 })
                .limit(4),
        ]);

        const activityFeed = [];

        recentEnrollments.forEach((e) => {
            if (e.user && e.course) {
                activityFeed.push({
                    type: "COURSE_COMPLETED",
                    title: `${e.user.name} completed course`,
                    subtitle: e.course.title,
                    timestamp: e.completedAt || e.updatedAt || e.createdAt,
                    icon: "🎓",
                    badgeColor: "success",
                });
            }
        });

        recentProgress.forEach((p) => {
            if (p.userId && p.lectureId && p.courseId) {
                activityFeed.push({
                    type: "LECTURE_COMPLETED",
                    title: `${p.userId.name} completed Lecture #${p.lectureId.lectureNumber}`,
                    subtitle: `${p.courseId.title} — ${p.lectureId.title}`,
                    timestamp: p.completedAt || p.updatedAt,
                    icon: "✓",
                    badgeColor: "info",
                });
            }
        });

        recentAttemptsList.forEach((att) => {
            if (att.userId && att.courseId) {
                activityFeed.push({
                    type: att.passed ? "ASSESSMENT_PASSED" : "ASSESSMENT_ATTEMPTED",
                    title: `${att.userId.name} ${att.passed ? "passed" : "attempted"} final assessment (${att.percentage}%)`,
                    subtitle: att.courseId.title,
                    timestamp: att.submittedAt || att.createdAt,
                    icon: att.passed ? "🏆" : "📝",
                    badgeColor: att.passed ? "success" : "warning",
                });
            }
        });

        recentCerts.forEach((cert) => {
            activityFeed.push({
                type: "CERTIFICATE_ISSUED",
                title: `Certificate issued to ${cert.studentName} (${cert.certificateId})`,
                subtitle: `${cert.courseName} • Score: ${cert.assessmentScore}%`,
                timestamp: cert.issuedAt || cert.completionDate,
                icon: "🏅",
                badgeColor: "golden",
            });
        });

        // Sort descending by timestamp and slice top 10
        activityFeed.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        const recentActivity = activityFeed.slice(0, 10);

        return res.status(200).json({
            success: true,
            filter: {
                timeRange,
                courseId: courseId || "all",
            },
            coursesDropdown: coursesList.map((c) => ({ _id: c._id, title: c.title })),
            overview: {
                totalStudents: totalStudentsCount,
                activeStudents: activeStudentsCount,
                totalCourses: totalCoursesCount,
                totalEnrollments: totalEnrollmentsCount,
                completedCourses: completedEnrollmentsCount,
                certificatesIssued: certificatesIssuedCount,
                completionRate: overallCompletionRate,
            },
            coursePerformance,
            assessmentAnalytics: {
                totalAttempts,
                passedAttempts,
                failedAttempts,
                passRate: assessmentPassRate,
                failRate: assessmentFailRate,
                averageScore: avgAssessmentScore,
                averageAttemptsPerStudent: avgAttemptsPerStudent,
            },
            difficultTopics: {
                hasData: difficultTopics.length > 0,
                message: difficultTopics.length === 0 ? "Not enough data yet." : null,
                items: difficultTopics.slice(0, 8),
            },
            lectureEngagement: {
                hasData: mostCompletedLectures.length > 0,
                mostCompleted: mostCompletedLectures,
                leastCompleted: leastCompletedLectures,
            },
            certificateAnalytics: {
                totalIssued: certificatesIssuedCount,
                byCourse: certificatesByCourse,
                completionToCertificateRatio,
            },
            aiAnalytics,
            recentActivity,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to load platform analytics",
            error: error.message,
        });
    }
};

module.exports = {
    getPlatformAnalytics,
};
