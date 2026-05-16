// This file defines the user data saved in MongoDB.
const mongoose = require("mongoose");

const userSChema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    role: String,

});

module.exports = mongoose.model("User", userSChema);