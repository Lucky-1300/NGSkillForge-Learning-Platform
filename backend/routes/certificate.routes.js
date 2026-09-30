const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const { optionalAuthMiddleware } = require("../middleware/auth.middleware");
const {
    getMyCertificates,
    getCertificateById,
    downloadCertificatePdf,
    verifyCertificatePublic,
    claimCourseCertificate,
} = require("../controllers/certificate.controller");

// Public verification endpoint (Strictly safe public data, no login required)
router.get("/verify/:certificateId", verifyCertificatePublic);

// Student's own certificates (requires authentication)
router.get("/my", authMiddleware, getMyCertificates);

// Claim/issue certificate for completed course
router.post("/claim/:courseId", authMiddleware, claimCourseCertificate);

// Download certificate PDF (server-generated)
router.get("/:certificateId/download", downloadCertificatePdf);

// View single certificate details
router.get("/:certificateId", optionalAuthMiddleware, getCertificateById);

module.exports = router;
