const mongoose = require("mongoose");

const lectureSchema = new mongoose.Schema(
    {
        courseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
            required: true,
            index: true,
        },
        lectureNumber: {
            type: Number,
            required: true,
            min: 1,
        },
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 300,
        },
        youtubeVideoId: {
            type: String,
            required: true,
            trim: true,
        },
        youtubeUrl: {
            type: String,
            required: true,
            trim: true,
        },
        thumbnailUrl: {
            type: String,
            default: "",
            trim: true,
        },
        duration: {
            type: String,
            default: "",
            trim: true,
        },
        playlistId: {
            type: String,
            default: "",
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

lectureSchema.index({ courseId: 1, lectureNumber: 1 }, { unique: true });
lectureSchema.index({ courseId: 1, youtubeVideoId: 1 });

module.exports = mongoose.model("Lecture", lectureSchema);
