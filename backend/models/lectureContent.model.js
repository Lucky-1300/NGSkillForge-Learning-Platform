const mongoose = require("mongoose");

const mcqSchema = new mongoose.Schema(
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
                message: "MCQ must contain at least 2 options",
            },
        },
        correctAnswer: {
            type: Number,
            required: true, // 0, 1, 2, 3 index
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

const practiceTaskSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
        difficulty: {
            type: String,
            enum: ["Easy", "Medium", "Hard"],
            default: "Easy",
        },
        expectedLearningOutcome: {
            type: String,
            default: "",
            trim: true,
        },
        requirements: {
            type: [String],
            default: [],
        },
        starterCode: {
            type: String,
            default: "",
        },
        solution: {
            type: String,
            default: "",
        },
        hints: {
            type: [String],
            default: [],
        },
    },
    { _id: true }
);

const sectionSchema = new mongoose.Schema(
    {
        heading: { type: String, required: true },
        content: { type: String, required: true },
        codeSnippet: { type: String, default: "" },
        language: { type: String, default: "javascript" },
    },
    { _id: false }
);

const lectureContentSchema = new mongoose.Schema(
    {
        lectureId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Lecture",
            required: true,
            index: true,
        },
        courseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
            required: true,
            index: true,
        },
        lectureNumber: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: ["draft", "published", "archived"],
            default: "draft",
            index: true,
        },
        generatedBy: {
            type: String,
            enum: ["ai", "admin", "system"],
            default: "ai",
        },
        reviewedBy: {
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
        publishedData: {
            type: mongoose.Schema.Types.Mixed,
            default: null,
        },
        notes: {
            type: String,
            default: "",
        },
        structuredNotes: {
            title: { type: String, default: "" },
            overview: { type: String, default: "" },
            sections: [sectionSchema],
            importantPoints: { type: [String], default: [] },
            keyTakeaways: { type: [String], default: [] },
            usefulResources: [
                {
                    title: { type: String, default: "" },
                    url: { type: String, default: "" },
                },
            ],
        },
        keyTakeaways: {
            type: [String],
            default: [],
        },
        importantNote: {
            type: String,
            default: "",
        },
        usefulResources: [
            {
                title: String,
                url: String,
            },
        ],
        tasks: [practiceTaskSchema],
        mcqs: [mcqSchema],
        sourceContext: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
    },
    {
        timestamps: true,
    }
);

lectureContentSchema.index({ courseId: 1, lectureNumber: 1 }, { unique: true });

module.exports = mongoose.model("LectureContent", lectureContentSchema);
