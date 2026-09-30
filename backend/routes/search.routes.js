const express = require("express");
const router = express.Router();
const { optionalAuthMiddleware } = require("../middleware/auth.middleware");
const { globalSearch } = require("../controllers/search.controller");

// Global search endpoint (Accessible to both guests & authenticated students)
router.get("/", optionalAuthMiddleware, globalSearch);

module.exports = router;
