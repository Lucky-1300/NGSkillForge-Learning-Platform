const mongoose = require("mongoose");

const transcriptSegmentSchema = new mongoose.Schema(
    {
        text: { type: String, required: true },
        start: { type: Number, default: 0 },
        duration: { type: Number, default: 0 },
    },
    { _id: false }
);

const lectureTranscriptSchema = new mongoose.Schema(
    {
        lectureId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Lecture",
            required: true,
            unique: true,
            index: true,
        },
        videoId: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        courseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
            required: true,
            index: true,
        },
        transcriptText: {
            type: String,
            default: "",
        },
        segments: {
            type: [transcriptSegmentSchema],
            default: [],
        },
        language: {
            type: String,
            default: "auto",
            trim: true,
        },
        source: {
            type: String,
            default: "youtube-captions",
        },
        status: {
            type: String,
            enum: ["available", "unavailable", "failed"],
            default: "available",
            index: true,
        },
        failureReason: {
            type: String,
            default: "",
        },
        characterCount: {
            type: Number,
            default: 0,
        },
        segmentCount: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("LectureTranscript", lectureTranscriptSchema);
