// This file defines the course data saved in MongoDB.
const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
    {
        id: { type: String, default: "" },
        question: { type: String, required: true },
        code: { type: String, default: "" },
        type: {
            type: String,
            enum: ["output", "mcq", "conceptual", "interview"],
            default: "output",
        },
        options: { type: [String], default: [] },
        answer: { type: String, required: true },
        explanation: { type: String, default: "" },
        category: { type: String, default: "General" },
        order: { type: Number, default: 1 },
    },
    {
        _id: false,
    }
);

const taskSchema = new mongoose.Schema(
    {
        id: { type: String, default: "" },
        taskNumber: { type: Number, required: true },
        title: { type: String, required: true },
        level: { type: String, default: "Level 1" },
        category: { type: String, default: "Variables" },
        description: { type: String, required: true },
        requirements: { type: [String], default: [] },
        example: { type: String, default: "" },
        hints: { type: [String], default: [] },
        starterCode: { type: String, default: "" },
    },
    {
        _id: false,
    }
);

const lessonSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200,
        },
        type: {
            type: String,
            enum: ["video", "text", "link", "file"],
            required: true,
        },
        content: {
            type: String,
            required: true,
            trim: true,
            maxlength: 50000,
        },
        notes: {
            type: String,
            default: "",
            trim: true,
            maxlength: 100000,
        },
        duration: {
            type: String,
            default: "",
            trim: true,
            maxlength: 100,
        },
        order: {
            type: Number,
            required: true,
            min: 1,
        },
        questions: {
            type: [questionSchema],
            default: [],
        },
        tasks: {
            type: [taskSchema],
            default: [],
        },
    },
    {
        _id: false,
    }
);

const moduleSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200,
        },
        order: {
            type: Number,
            required: true,
            min: 1,
        },
        description: {
            type: String,
            default: "",
            trim: true,
        },
        notesDocUrl: {
            type: String,
            default: "",
            trim: true,
        },
        lessons: {
            type: [lessonSchema],
            default: [],
        },
        questions: {
            type: [questionSchema],
            default: [],
        },
        tasks: {
            type: [taskSchema],
            default: [],
        },
    },
    {
        _id: false,
    }
);

const courseSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200,
        },

        description: {
            type: String,
            required: true,
            trim: true,
            maxlength: 3000,
        },

        instructor: {
            type: String,
            required: true,
            trim: true,
            maxlength: 150,
        },

        price: {
            type: Number,
            required: true,
            min: 0,
            default: 0,
        },

        thumbnail: {
            type: String,
            default: "",
        },

        notesDocUrl: {
            type: String,
            default: "",
            trim: true,
        },

        category: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
        },

        level: {
            type: String,
            enum: ["Beginner", "Intermediate", "Advanced"],
            default: "Beginner",
        },

        duration: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
        },

        order: {
            type: Number,
            default: 99,
        },

        modules: {
            type: [moduleSchema],
            default: [],
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Course", courseSchema);