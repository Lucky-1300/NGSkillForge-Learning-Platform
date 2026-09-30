const mongoose = require("mongoose");

const studentAchievementSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        achievementKey: {
            type: String,
            required: true,
            enum: ["FIRST_LECTURE", "TEN_LECTURES", "FIRST_ASSESSMENT", "FIRST_COURSE"],
            index: true,
        },
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        icon: {
            type: String,
            default: "🏆",
        },
        earnedAt: {
            type: Date,
            default: Date.now,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

// Compound unique index ensuring only ONE achievement of a particular type per user
studentAchievementSchema.index({ userId: 1, achievementKey: 1 }, { unique: true });

module.exports = mongoose.model("StudentAchievement", studentAchievementSchema);
