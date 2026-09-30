// Main server file that starts the app, loads routes, middleware, and connects to the database.
require("dotenv").config();
const dns = require("dns");

// Use Google DNS servers to resolve MongoDB Atlas SRV records reliably
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const courseRoutes = require("./routes/course.routes");
const assignmentRoutes = require("./routes/assignment.routes");
const enrollmentRoutes = require("./routes/enrollment.routes");
const lectureRoutes = require("./routes/lecture.routes");
const aiRoutes = require("./routes/ai.routes");
const progressRoutes = require("./routes/progress.routes");
const adminContentRoutes = require("./routes/adminContent.routes");
const assessmentRoutes = require("./routes/assessment.routes");
const adminAssessmentRoutes = require("./routes/adminAssessment.routes");
const certificateRoutes = require("./routes/certificate.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const analyticsRoutes = require("./routes/analytics.routes");
const searchRoutes = require("./routes/search.routes");

const loggerMiddleware = require(
    "./middleware/logger.middleware"
);

const errorMiddleware = require(
    "./middleware/error.middleware"
);

const app = express();

const allowedOrigins = (process.env.FRONTEND_URLS || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error("Origin is not allowed by CORS"));
    },
    credentials: true,
}));

app.use(express.json({ limit: "1mb" }));

app.use(loggerMiddleware);

// Root route
app.get("/", (req, res) => {
    res.json({ success: true, message: "NGSkillForge API is running" });
});

app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "NGSkillForge API is running",
        database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    });
});

const authLimiter = rateLimit({
    windowMs: Number(process.env.AUTH_RATE_WINDOW_MS) || 15 * 60 * 1000,
    limit: Number(process.env.AUTH_RATE_LIMIT) || 100,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { success: false, message: "Too many authentication requests. Please try again later." },
});

app.use("/api/auth", authLimiter);

app.use("/api/auth", authRoutes);

app.use("/api/users", userRoutes);

app.use("/api/courses", courseRoutes);

app.use("/api/v1/courses", courseRoutes);

app.use("/api/assignments", assignmentRoutes);

app.use("/api/enrollments", enrollmentRoutes);

app.use("/api/lectures", lectureRoutes);

app.use("/api/v1/lectures", lectureRoutes);

app.use("/api/ai", aiRoutes);

app.use("/api/v1/ai", aiRoutes);

app.use("/api/progress", progressRoutes);

app.use("/api/v1/progress", progressRoutes);

app.use("/api/admin/content", adminContentRoutes);

app.use("/api/v1/admin/content", adminContentRoutes);

app.use("/api/assessments", assessmentRoutes);

app.use("/api/v1/assessments", assessmentRoutes);

app.use("/api/admin/assessments", adminAssessmentRoutes);

app.use("/api/v1/admin/assessments", adminAssessmentRoutes);

app.use("/api/certificates", certificateRoutes);

app.use("/api/v1/certificates", certificateRoutes);

app.use("/api/student", dashboardRoutes);

app.use("/api/v1/student", dashboardRoutes);

app.use("/api/admin/analytics", analyticsRoutes);

app.use("/api/v1/admin/analytics", analyticsRoutes);

app.use("/api/search", searchRoutes);

app.use("/api/v1/search", searchRoutes);


mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected ✅"))
    .catch((error) => console.error("MongoDB connection failed:", error.message));


app.use(errorMiddleware);


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});