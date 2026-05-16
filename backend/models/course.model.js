// This file defines the course data saved in MongoDB.
const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },

        description: {
            type: String,
            required: true,
        },

        instructor: {
            type: String,
            required: true,
        },

        price: {
            type: Number,
            required: true,
        },

        thumbnail: {
            type: String,
            default: "",
        },

        category: {
            type: String,
            required: true,
        },

        level: {
            type: String,
            enum: ["Beginner", "Intermediate", "Advanced"],
            default: "Beginner",
        },

        duration: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Course", courseSchema);