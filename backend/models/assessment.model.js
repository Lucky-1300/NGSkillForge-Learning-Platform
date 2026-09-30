const mongoose = require("mongoose");

const assessmentQuestionSchema = new mongoose.Schema(
    {
        question: {
            type: String,
            required: true,
            trim: true,
        },
        codeSnippet: {
            type: String,
            default: "",
        },
        options: {
            type: [String],
            required: true,
            validate: {
                validator: (arr) => Array.isArray(arr) && arr.length >= 2,
                message: "Assessment question must contain at least 2 options",
            },
        },
        correctAnswer: {
            type: Number,
            required: true,
            min: 0,
        },
        explanation: {
            type: String,
            default: "",
            trim: true,
        },
        difficulty: {
            type: String,
            enum: ["Easy", "Medium", "Hard"],
            default: "Medium",
        },
    },
    { _id: true }
);

const assessmentSchema = new mongoose.Schema(
    {
        courseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
            required: true,
            index: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
            default: "Final Course Assessment",
        },
        description: {
            type: String,
            default: "Comprehensive final assessment evaluating your mastery of all course modules and lectures.",
            trim: true,
        },
        status: {
            type: String,
            enum: ["draft", "published", "archived"],
            default: "draft",
            index: true,
        },
        passingPercentage: {
            type: Number,
            required: true,
            default: 70,
            min: 1,
            max: 100,
        },
        timeLimitMinutes: {
            type: Number,
            default: 30, // 0 or null for untimed
            min: 0,
        },
        maxAttempts: {
            type: Number,
            default: 0, // 0 = unlimited retries
            min: 0,
        },
        questions: [assessmentQuestionSchema],
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        publishedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        publishedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

assessmentSchema.index({ courseId: 1, status: 1 });

module.exports = mongoose.model("Assessment", assessmentSchema);
