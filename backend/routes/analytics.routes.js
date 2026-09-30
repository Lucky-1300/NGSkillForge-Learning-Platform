const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");
const { getPlatformAnalytics } = require("../controllers/analytics.controller");

// All analytics routes require authentication + Admin role
router.use(authMiddleware);
router.use(roleMiddleware("admin"));

// Consolidated Platform Analytics Endpoint
router.get("/overview", getPlatformAnalytics);
router.get("/", getPlatformAnalytics);

module.exports = router;
