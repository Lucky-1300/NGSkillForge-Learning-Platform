// This file defines the user data saved in MongoDB.
const mongoose = require("mongoose");

const userSChema = new mongoose.Schema({
    name: { type: String, required: true, trim: true, minlength: 3, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ["user", "admin"], default: "user" },
}, {
    toJSON: {
        transform: (doc, ret) => { delete ret.password; return ret; },
    },
});

module.exports = mongoose.model("User", userSChema);