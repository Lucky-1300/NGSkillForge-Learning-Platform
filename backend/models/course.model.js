// This file defines the course data saved in MongoDB.
const mongoose = require("mongoose");

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
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Course", courseSchema);