const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const { getStudentDashboard } = require("../controllers/dashboard.controller");

// Authenticated student dashboard route
router.get("/dashboard", authMiddleware, getStudentDashboard);

module.exports = router;
