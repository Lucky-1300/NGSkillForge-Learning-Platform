const Enrollment = require("../models/enrollment.model");
const Progress = require("../models/progress.model");
const Lecture = require("../models/lecture.model");
const Course = require("../models/course.model");
const Assessment = require("../models/assessment.model");
const AssessmentAttempt = require("../models/assessmentAttempt.model");
const Certificate = require("../models/certificate.model");
const User = require("../models/user.model");
const { evaluateAndAwardAchievements } = require("../services/achievement.service");

/**
 * GET /api/student/dashboard
 * Consolidated student dashboard API returning overview, in-progress courses, completed courses,
 * real recent activity, certificates, and achievements.
 */
const getStudentDashboard = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Authentication required." });
        }

        const user = await User.findById(userId).select("name email role avatar");
        if (!user) {
            return res.status(404).json({ success: false, message: "User account not found." });
        }

        // 1. Evaluate & award any newly qualified achievements
        const achievementData = await evaluateAndAwardAchievements(userId);

        // 2. Fetch all user enrollments with course details
        const enrollments = await Enrollment.find({ user: userId })
            .populate("course", "title description category level thumbnail duration slug")
            .sort({ updatedAt: -1 });

        // Filter out any broken course references
        const validEnrollments = enrollments.filter((e) => e.course != null);

        // Fetch all certificates for the user
        const certificates = await Certificate.find({ userId })
            .populate("courseId", "title category level thumbnail duration")
            .sort({ completionDate: -1, createdAt: -1 });

        const certificateCourseMap = new Map();
        certificates.forEach((c) => {
            if (c.courseId) {
                const cid = c.courseId._id ? c.courseId._id.toString() : c.courseId.toString();
                certificateCourseMap.set(cid, c);
            }
        });

        // 3. Process each course into In-Progress vs Completed
        const inProgressCourses = [];
        const completedCourses = [];

        for (const enroll of validEnrollments) {
            const course = enroll.course;
            const courseId = course._id;

            const [totalLectures, completedProgressDocs, lastAccessedProgress, passedAttempt] = await Promise.all([
                Lecture.countDocuments({ courseId }),
                Progress.find({ userId, courseId, completed: true }).select("lectureId completedAt"),
                Progress.findOne({ userId, courseId }).sort({ lastAccessedAt: -1, updatedAt: -1 }).populate("lectureId", "title lectureNumber moduleTitle"),
                AssessmentAttempt.findOne({ userId, courseId, passed: true }).sort({ percentage: -1 }),
            ]);

            const completedLecturesCount = completedProgressDocs.length;
            const progressPercent = totalLectures > 0 ? Math.min(100, Math.round((completedLecturesCount / totalLectures) * 100)) : 0;
            const isCompleted = Boolean(enroll.courseCompleted || (completedLecturesCount >= totalLectures && totalLectures > 0 && passedAttempt));

            const matchingCert = certificateCourseMap.get(courseId.toString());

            if (isCompleted) {
                completedCourses.push({
                    courseId: course._id,
                    title: course.title,
                    category: course.category,
                    level: course.level,
                    thumbnail: course.thumbnail,
                    duration: course.duration,
                    totalLectures,
                    completedLectures: completedLecturesCount,
                    progressPercent: 100,
                    assessmentScore: matchingCert?.assessmentScore || passedAttempt?.percentage || enroll.bestAssessmentScore || 100,
                    completedAt: matchingCert?.completionDate || enroll.completedAt || passedAttempt?.submittedAt || new Date(),
                    certificateId: matchingCert?.certificateId || null,
                    certificateUrl: matchingCert ? `/certificate/${matchingCert.certificateId}` : null,
                });
            } else {
                // Determine next lecture to continue
                let continueLecture = null;
                if (lastAccessedProgress && lastAccessedProgress.lectureId) {
                    continueLecture = {
                        lectureId: lastAccessedProgress.lectureId._id,
                        title: lastAccessedProgress.lectureId.title,
                        lectureNumber: lastAccessedProgress.lectureId.lectureNumber,
                        moduleTitle: lastAccessedProgress.lectureId.moduleTitle,
                    };
                } else {
                    // Find first lecture of course
                    const firstLecture = await Lecture.findOne({ courseId }).sort({ lectureNumber: 1, order: 1 });
                    if (firstLecture) {
                        continueLecture = {
                            lectureId: firstLecture._id,
                            title: firstLecture.title,
                            lectureNumber: firstLecture.lectureNumber,
                            moduleTitle: firstLecture.moduleTitle,
                        };
                    }
                }

                inProgressCourses.push({
                    courseId: course._id,
                    title: course.title,
                    category: course.category,
                    level: course.level,
                    thumbnail: course.thumbnail,
                    duration: course.duration,
                    totalLectures,
                    completedLectures: completedLecturesCount,
                    progressPercent,
                    continueLecture,
                    continueUrl: continueLecture ? `/courses/${course._id}/learn/${continueLecture.lectureNumber}` : `/courses/${course._id}/learn`,
                });
            }
        }

        // 4. Construct Real Recent Activity Feed (No fake events)
        const [recentProgress, recentAttempts, recentCerts] = await Promise.all([
            Progress.find({ userId, completed: true })
                .sort({ completedAt: -1, updatedAt: -1 })
                .limit(6)
                .populate("lectureId", "title lectureNumber")
                .populate("courseId", "title"),
            AssessmentAttempt.find({ userId })
                .sort({ submittedAt: -1, createdAt: -1 })
                .limit(4)
                .populate("courseId", "title")
                .populate("assessmentId", "title"),
            Certificate.find({ userId })
                .sort({ issuedAt: -1, createdAt: -1 })
                .limit(3),
        ]);

        const activityFeed = [];

        recentProgress.forEach((p) => {
            if (p.lectureId && p.courseId) {
                activityFeed.push({
                    type: "LECTURE_COMPLETED",
                    title: `Completed Lecture #${p.lectureId.lectureNumber}: ${p.lectureId.title}`,
                    subtitle: p.courseId.title,
                    timestamp: p.completedAt || p.updatedAt || p.createdAt,
                    icon: "✓",
                    badgeColor: "success",
                });
            }
        });

        recentAttempts.forEach((att) => {
            if (att.courseId) {
                activityFeed.push({
                    type: att.passed ? "ASSESSMENT_PASSED" : "ASSESSMENT_ATTEMPTED",
                    title: att.passed
                        ? `Passed Final Assessment (${att.percentage}%)`
                        : `Attempted Final Assessment (${att.percentage}%)`,
                    subtitle: att.courseId.title,
                    timestamp: att.submittedAt || att.createdAt,
                    icon: att.passed ? "🎉" : "📝",
                    badgeColor: att.passed ? "primary" : "warning",
                });
            }
        });

        recentCerts.forEach((cert) => {
            activityFeed.push({
                type: "CERTIFICATE_ISSUED",
                title: `Earned Certificate of Completion (${cert.certificateId})`,
                subtitle: cert.courseName,
                timestamp: cert.issuedAt || cert.completionDate,
                icon: "🏆",
                badgeColor: "golden",
                link: `/certificate/${cert.certificateId}`,
            });
        });

        // Sort all real activity by timestamp descending and take top 8
        activityFeed.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        const recentActivity = activityFeed.slice(0, 8);

        // 5. Overview Counters
        const overview = {
            enrolledCoursesCount: validEnrollments.length,
            inProgressCoursesCount: inProgressCourses.length,
            completedCoursesCount: completedCourses.length,
            certificatesEarnedCount: certificates.length,
        };

        return res.status(200).json({
            success: true,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
            },
            overview,
            inProgressCourses,
            completedCourses,
            certificates: certificates.map((c) => ({
                _id: c._id,
                certificateId: c.certificateId,
                courseName: c.courseName,
                courseDetails: c.courseId,
                completionDate: c.completionDate,
                assessmentScore: c.assessmentScore,
                issuedAt: c.issuedAt,
                downloadUrl: `/api/certificates/${c.certificateId}/download`,
                viewUrl: `/certificate/${c.certificateId}`,
            })),
            achievements: achievementData.allAchievements,
            recentActivity,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to load student dashboard.",
            error: error.message,
        });
    }
};

module.exports = {
    getStudentDashboard,
};
