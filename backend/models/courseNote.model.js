const mongoose = require("mongoose");

const noteSectionSchema = new mongoose.Schema(
    {
        heading: { type: String, default: "" },
        content: { type: String, default: "" },
        codeSnippet: { type: String, default: "" },
        language: { type: String, default: "html" },
    },
    { _id: false }
);

const noteTopicSchema = new mongoose.Schema(
    {
        topicId: {
            type: String,
            required: true,
            trim: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        order: {
            type: Number,
            required: true,
        },
        summary: {
            type: String,
            default: "",
            trim: true,
        },
        content: {
            type: String,
            required: true,
        },
        sections: {
            type: [noteSectionSchema],
            default: [],
        },
    },
    { _id: true }
);

const courseNoteSchema = new mongoose.Schema(
    {
        courseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
            required: true,
            index: true,
        },
        courseSlug: {
            type: String,
            required: true,
            index: true,
            trim: true,
        },
        courseTitle: {
            type: String,
            required: true,
            trim: true,
        },
        topics: {
            type: [noteTopicSchema],
            default: [],
        },
        sourceUrl: {
            type: String,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

courseNoteSchema.index({ courseId: 1, courseSlug: 1 });

module.exports = mongoose.model("CourseNote", courseNoteSchema);
