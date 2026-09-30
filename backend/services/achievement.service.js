const StudentAchievement = require("../models/studentAchievement.model");
const Progress = require("../models/progress.model");
const AssessmentAttempt = require("../models/assessmentAttempt.model");
const Enrollment = require("../models/enrollment.model");
const Certificate = require("../models/certificate.model");

const ACHIEVEMENT_DEFINITIONS = [
    {
        key: "FIRST_LECTURE",
        title: "First Step",
        description: "Completed your very first lecture on NGSkillForge.",
        icon: "🎯",
        category: "Learning",
    },
    {
        key: "TEN_LECTURES",
        title: "Knowledge Builder",
        description: "Completed 10 educational lectures across your courses.",
        icon: "📚",
        category: "Dedication",
    },
    {
        key: "FIRST_ASSESSMENT",
        title: "Assessment Ace",
        description: "Passed your first course final assessment.",
        icon: "📝",
        category: "Mastery",
    },
    {
        key: "FIRST_COURSE",
        title: "Course Champion",
        description: "Successfully completed an entire course and earned your certification.",
        icon: "🏆",
        category: "Graduation",
    },
];

/**
 * Check real database events and evaluate/award any earned achievements for a student
 * @param {string|mongoose.Types.ObjectId} userId
 * @returns {Promise<{ earnedAchievements: Array, allAchievements: Array, newlyAwarded: Array }>}
 */
async function evaluateAndAwardAchievements(userId) {
    if (!userId) {
        return {
            earnedAchievements: [],
            allAchievements: ACHIEVEMENT_DEFINITIONS.map((def) => ({ ...def, isEarned: false, earnedAt: null })),
            newlyAwarded: [],
        };
    }

    // 1. Gather real database statistics
    const [completedLecturesCount, passedAssessmentsCount, completedCoursesCount, certificatesCount] = await Promise.all([
        Progress.countDocuments({ userId, completed: true }),
        AssessmentAttempt.countDocuments({ userId, passed: true }),
        Enrollment.countDocuments({ user: userId, courseCompleted: true }),
        Certificate.countDocuments({ userId }),
    ]);

    const qualifiedKeys = new Set();

    if (completedLecturesCount >= 1) {
        qualifiedKeys.add("FIRST_LECTURE");
    }
    if (completedLecturesCount >= 10) {
        qualifiedKeys.add("TEN_LECTURES");
    }
    if (passedAssessmentsCount >= 1) {
        qualifiedKeys.add("FIRST_ASSESSMENT");
    }
    if (completedCoursesCount >= 1 || certificatesCount >= 1) {
        qualifiedKeys.add("FIRST_COURSE");
    }

    // 2. Fetch existing achievements
    const existingAchievements = await StudentAchievement.find({ userId });
    const existingKeys = new Set(existingAchievements.map((a) => a.achievementKey));

    // 3. Award new achievements atomically
    const newlyAwarded = [];
    for (const def of ACHIEVEMENT_DEFINITIONS) {
        if (qualifiedKeys.has(def.key) && !existingKeys.has(def.key)) {
            try {
                const created = await StudentAchievement.findOneAndUpdate(
                    { userId, achievementKey: def.key },
                    {
                        $setOnInsert: {
                            userId,
                            achievementKey: def.key,
                            title: def.title,
                            description: def.description,
                            icon: def.icon,
                            earnedAt: new Date(),
                        },
                    },
                    { upsert: true, returnDocument: 'after' }
                );
                if (created) {
                    newlyAwarded.push(created);
                }
            } catch (err) {
                // Ignore potential duplicate key errors in race conditions
            }
        }
    }

    // 4. Fetch updated list of earned achievements
    const allEarned = await StudentAchievement.find({ userId }).sort({ earnedAt: -1 });
    const earnedMap = new Map(allEarned.map((a) => [a.achievementKey, a]));

    const allAchievements = ACHIEVEMENT_DEFINITIONS.map((def) => {
        const earnedDoc = earnedMap.get(def.key);
        return {
            key: def.key,
            title: def.title,
            description: def.description,
            icon: def.icon,
            category: def.category,
            isEarned: Boolean(earnedDoc),
            earnedAt: earnedDoc ? earnedDoc.earnedAt : null,
        };
    });

    return {
        earnedAchievements: allEarned,
        allAchievements,
        newlyAwarded,
        stats: {
            completedLecturesCount,
            passedAssessmentsCount,
            completedCoursesCount: Math.max(completedCoursesCount, certificatesCount),
        },
    };
}

module.exports = {
    ACHIEVEMENT_DEFINITIONS,
    evaluateAndAwardAchievements,
};
