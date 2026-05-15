require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const courseRoutes = require("./routes/course.routes");
const assignmentRoutes = require("./routes/assignment.routes");
const enrollmentRoutes = require("./routes/enrollment.routes");

const loggerMiddleware = require(
    "./middleware/logger.middleware"
);

const errorMiddleware = require(
    "./middleware/error.middleware"
);

const app = express();


app.use(express.json());

app.use(loggerMiddleware);


app.use("/api/auth", authRoutes);

app.use("/api/users", userRoutes);

app.use("/api/courses", courseRoutes);

app.use("/api/assignments", assignmentRoutes);

app.use("/api/enrollments", enrollmentRoutes);


mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log("MongoDB Connected ✅");
})
.catch((error) => {
    console.log(error);
});


app.use(errorMiddleware);


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});