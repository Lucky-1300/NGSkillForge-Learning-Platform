const mongoose = require("mongoose");

const answerRecordSchema = new mongoose.Schema(
    {
        questionId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        selectedOption: {
            type: Number,
            default: null, // index selected by student, or null if skipped
        },
        isCorrect: {
            type: Boolean,
            default: false,
        },
        correctAnswer: {
            type: Number, // stored after grading
        },
        explanation: {
            type: String, // stored after grading for review
            default: "",
        },
    },
    { _id: false }
);

const assessmentAttemptSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        courseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
            required: true,
            index: true,
        },
        assessmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Assessment",
            required: true,
            index: true,
        },
        attemptNumber: {
            type: Number,
            required: true,
            default: 1,
        },
        answers: [answerRecordSchema],
        totalQuestions: {
            type: Number,
            required: true,
            default: 0,
        },
        correctAnswers: {
            type: Number,
            required: true,
            default: 0,
        },
        score: {
            type: Number,
            required: true,
            default: 0,
        },
        percentage: {
            type: Number,
            required: true,
            default: 0,
            min: 0,
            max: 100,
        },
        passingPercentage: {
            type: Number,
            required: true,
            default: 70,
        },
        passed: {
            type: Boolean,
            required: true,
            default: false,
            index: true,
        },
        status: {
            type: String,
            enum: ["in_progress", "submitted", "expired"],
            default: "submitted",
            index: true,
        },
        startedAt: {
            type: Date,
            default: Date.now,
        },
        submittedAt: {
            type: Date,
            default: Date.now,
        },
        timeSpentSeconds: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

assessmentAttemptSchema.index({ userId: 1, courseId: 1, attemptNumber: 1 });
assessmentAttemptSchema.index({ userId: 1, assessmentId: 1, createdAt: -1 });

module.exports = mongoose.model("AssessmentAttempt", assessmentAttemptSchema);
