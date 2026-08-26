// This file connects the app to MongoDB using Mongoose.
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const mongoose = require("mongoose");

const connectDB = async () => {
    try {

        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB Connected ✅");

    } catch (error) {

        console.log("MongoDB Connection Error ❌");
        console.log(error);

    }
};

module.exports = connectDB;