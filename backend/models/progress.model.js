// This file defines the student progress model for tracking lecture completion in MongoDB.
const mongoose = require("mongoose");

const progressSchema = new mongoose.Schema(
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
        lectureId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Lecture",
            required: true,
            index: true,
        },
        completed: {
            type: Boolean,
            default: false,
            index: true,
        },
        completedAt: {
            type: Date,
            default: null,
        },
        lastAccessedAt: {
            type: Date,
            default: Date.now,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

// Compound unique index ensuring a single progress record per user per lecture
progressSchema.index({ userId: 1, lectureId: 1 }, { unique: true });

// Compound indexes for querying all progress within a course and sorting by recent activity
progressSchema.index({ userId: 1, courseId: 1 });
progressSchema.index({ userId: 1, courseId: 1, lastAccessedAt: -1 });

module.exports = mongoose.model("Progress", progressSchema);
