// This file defines the course data saved in MongoDB.
const mongoose = require("mongoose");

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
            maxlength: 10000,
        },
        notes: {
            type: String,
            default: "",
            trim: true,
            maxlength: 10000,
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
        lessons: {
            type: [lessonSchema],
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
        },

        thumbnail: {
            type: String,
            default: "",
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