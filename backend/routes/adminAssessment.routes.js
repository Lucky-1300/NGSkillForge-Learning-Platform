const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");
const {
    getAdminAssessments,
    getAdminAssessmentById,
    createAdminAssessment,
    updateAdminAssessment,
    publishAdminAssessment,
    unpublishAdminAssessment,
    deleteAdminAssessment,
} = require("../controllers/assessment.controller");

// All admin assessment endpoints require authentication + Admin role
router.use(authMiddleware);
router.use(roleMiddleware("admin"));

router.get("/", getAdminAssessments);
router.get("/:assessmentId", getAdminAssessmentById);
router.post("/", createAdminAssessment);
router.put("/:assessmentId", updateAdminAssessment);
router.delete("/:assessmentId", deleteAdminAssessment);
router.post("/:assessmentId/publish", publishAdminAssessment);
router.post("/:assessmentId/unpublish", unpublishAdminAssessment);

module.exports = router;
