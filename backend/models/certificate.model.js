const mongoose = require("mongoose");

const certificateSchema = new mongoose.Schema(
    {
        certificateId: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true,
            index: true,
        },
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
        studentName: {
            type: String,
            required: true,
            trim: true,
        },
        courseName: {
            type: String,
            required: true,
            trim: true,
        },
        completionDate: {
            type: Date,
            required: true,
            default: Date.now,
        },
        assessmentScore: {
            type: Number,
            required: true,
            min: 0,
            max: 100,
        },
        issuedAt: {
            type: Date,
            default: Date.now,
            index: true,
        },
        pdfGenerated: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// Compound unique index ensuring only ONE certificate exists per user per course
certificateSchema.index({ userId: 1, courseId: 1 }, { unique: true });

module.exports = mongoose.model("Certificate", certificateSchema);
