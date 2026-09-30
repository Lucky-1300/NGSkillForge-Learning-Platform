// This file stores which user enrolled in which course.
const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},

		course: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Course",
			required: true,
		},

		completedLessons: {
			type: [String],
			default: [],
		},

		completedQuestions: {
			type: [String],
			default: [],
		},

		completedTasks: {
			type: [String],
			default: [],
		},

		progress: {
			type: Number,
			default: 0,
			min: 0,
			max: 100,
		},

		courseCompleted: {
			type: Boolean,
			default: false,
			index: true,
		},

		completedAt: {
			type: Date,
			default: null,
		},

		assessmentPassed: {
			type: Boolean,
			default: false,
		},

		bestAssessmentScore: {
			type: Number,
			default: 0,
		},
	},
	{
		timestamps: true,
	}
);

enrollmentSchema.index({ user: 1, course: 1 }, { unique: true });

module.exports = mongoose.model("Enrollment", enrollmentSchema);